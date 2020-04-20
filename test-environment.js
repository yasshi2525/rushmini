const NodeEnvironment = require("jest-environment-node");
const fs = require("fs");
const g = require("@akashic/akashic-engine");
const driver = require("@akashic/game-driver");
const { JSDOM } = require("jsdom");

const createGame = () =>
  new driver.Game({
    configuration: { width: 640, height: 360 },
    player: { id: 99999 },
  });

class AkashicEngineEnvironment extends NodeEnvironment {
  async setup() {
    // g.game インスタンスを生成しておく
    await super.setup();
    if (!g.game) {
      g.game = createGame();
    }
    this.global.g = g;
    // game を繰り返し使うテストのために、作成関数を定義
    this.global.recreateGame = () => (g.game = createGame());
    // windoe を定義
    this.global.window = new JSDOM().window;
  }

  runScript(script) {
    return super.runScript(script);
  }

  async teardown() {
    this.global.g = null;
    await super.teardown();
  }
}

module.exports = AkashicEngineEnvironment;
