/**
 * プログラム中から参照している g.game は Akashic Engine が作成したもの。
 * 単体テストのために事前にインスタンスを生成する
 */

const NodeEnvironment = require("jest-environment-node");
const fs = require("fs");
const btoa = require("btoa");

// 呼び出し順序 akashic-engine -> game-driver -> pdi-browser -> XHR
const { JSDOM } = require("jsdom");
window = new JSDOM().window;
document = window.document;
const raf = require("raf");
requestAnimationFrame = raf;
navigator = window.navigator;
window.AudioContext = require("web-audio-test-api").AudioContext;
const pdi = require("@akashic/pdi-browser");
const gdr = require("@akashic/game-driver");
const g = require("@akashic/akashic-engine");

// createSpriteFromE すると Image given has not completed loading が発生するためモック化
g.Util.createSpriteFromE = (scene, e) => {
  return new g.E({ scene });
};

/**
 * pdi-browser は XHR で game.json を取得している。これを fs 経由の取得に切り替える
 */
class FileSystemPlatform extends pdi.Platform {
  loadGameConfiguration(_, cb) {
    fs.readFile("game.json", (err, data) => {
      if (err) {
        cb(err, null);
      } else {
        cb(null, JSON.parse(data));
      }
    });
    return;
  }
}

// 参考 : pdi-browser の XHRScriptAsset
class FileSystemScriptAsset extends g.ScriptAsset {
  static PRE_SCRIPT =
    "(function(exports, require, module, __filename, __dirname) {";
  static POST_SCRIPT =
    "\n})(g.module.exports, g.module.require, g.module, g.filename, g.dirname);";

  constructor(id, assetPath) {
    super(id, assetPath);
    this.script = undefined;
  }

  _load(handler) {
    this.script = fs.readFileSync(this.path).toString();
    handler._onAssetLoad(this);
  }

  execute(env) {
    const func = this._wrap();
    func(env);
    return env.module.exports;
  }

  _wrap() {
    return new Function(
      "g",
      FileSystemScriptAsset.PRE_SCRIPT +
        this.script +
        FileSystemScriptAsset.POST_SCRIPT
    );
  }
}

// 参考 : pdi-browser の XHRTextAsset
class FileSystemTextAsset extends g.TextAsset {
  constructor(id, assetPath) {
    super(id, assetPath);
    this.data = undefined;
  }

  _load(handler) {
    this.data = fs.readFileSync(this.path);
    handler._onAssetLoad(this);
  }
}

// 参考 : pid-browser の HTMLImageAsset
class FileSystemImageAsset extends g.ImageAsset {
  _load(handler) {
    const image = document.createElement("img");
    image.src = "data:image/png;base64," + btoa(fs.readFileSync(this.path));
    this.data = image;
    handler._onAssetLoad(this);
  }

  asSurface() {
    if (!this._surface) {
      this._surface = new g.Surface(this.width, this.height, this.data);
    }
    return this._surface;
  }
}

class FileSystemResourceFactory extends pdi.ResourceFactory {
  createImageAsset(id, assetPath, width, height) {
    return new FileSystemImageAsset(id, assetPath, width, height);
  }
  createScriptAsset(id, assetPath) {
    return new FileSystemScriptAsset(id, assetPath);
  }
  createTextAsset(id, assetPath) {
    return new FileSystemTextAsset(id, assetPath);
  }
}

/**
 * g.Game インスタンスを生成
 */
const createGame = async () => {
  const audio = new pdi.AudioPluginManager();
  audio.tryInstallPlugin([new pdi.WebAudioPlugin()]);
  const driver = new gdr.GameDriver({
    platform: new FileSystemPlatform({
      resourceFactory: new FileSystemResourceFactory({
        audioPluginManager: audio,
      }),
      amflow: new gdr.MemoryAmflowClient({
        playId: "dummyPlayID",
      }),
      containerView: document.createElement("div"),
    }),
    player: {
      id: "dummyPlayerID",
      name: "test",
    },
    errorHandler: (err) => console.error(err),
  });

  await driver.doInitialize({
    driverConfiguration: {
      playId: "dummyPlayID",
      playToken: gdr.MemoryAmflowClient.TOKEN_ACTIVE,
      executionMode: gdr.ExecutionMode.Active,
    },
    configurationBase: __dirname + "/",
    configurationUrl: __dirname + "/",
    loopConfiguration: {
      loopMode: gdr.LoopMode.Realtime,
    },
  });
  return driver._game;
};

class AkashicEngineEnvironment extends NodeEnvironment {
  async setup() {
    // g.game インスタンスを生成しておく
    await super.setup();
    // window を定義
    this.global.window = window;
    this.global.g = g;
    g.game = await createGame();

    // game を繰り返し使うテストのために、作成関数を定義
    this.global.recreateGame = async () => {
      g.game = await createGame();
    };
  }

  runScript(script) {
    return super.runScript(script);
  }

  async teardown() {
    delete this.global.g;
    delete this.global.recreateGame;
    delete this.global.window;
    await super.teardown();
  }
}

module.exports = AkashicEngineEnvironment;
