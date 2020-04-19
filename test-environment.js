const NodeEnvironment = require("jest-environment-node");
const fs = require("fs");
const g = require("@akashic/akashic-engine");
const driver = require("@akashic/game-driver");

class AkashicEngineEnvironment extends NodeEnvironment {
  async setup() {
    await super.setup();
    if (!g.game) {
      g.game = new driver.Game({
        configuration: { width: 640, height: 360 },
        player: { id: 99999 },
      });
    }
    this.global.g = g;
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
