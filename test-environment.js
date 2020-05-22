/**
 * プログラム中から参照している g.game は Akashic Engine が作成したもの。
 * 単体テストのために事前にインスタンスを生成する
 */

const NodeEnvironment = require("jest-environment-node");
const fs = require("fs");
const btoa = require("btoa");

// 呼び出し順序 akashic-engine -> game-driver -> pdi-browser -> XHR
const { JSDOM } = require("jsdom");
window = new JSDOM(``, { url: "http://localhost", resources: "usable" }).window;
document = window.document;
require("raf/polyfill");
requestAnimationFrame = window.requestAnimationFrame;
cancelAnimationFrame = window.cancelAnimationFrame;
navigator = window.navigator;
window.AudioContext = require("web-audio-test-api").AudioContext;
const pdi = require("@akashic/pdi-browser");
const gdr = require("@akashic/game-driver");
const g = require("@akashic/akashic-engine");

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

// 参考 : pdi-browser の WebAudioAsset
class FileSystemAudioAsset extends g.AudioAsset {
  _load(loader) {
    fs.readFile(this.path + ".ogg", (err, data) => {
      if (err) loader._onAssetError(this, err);
      else {
        const ab = new ArrayBuffer(data.length);
        const view = new Uint8Array(ab);
        data.forEach((b, idx) => (view[idx] = b));
        const context = new AudioContext();
        context.decodeAudioData(ab, (r) => {
          this.data = r;
          loader._onAssetLoad(this);
        });
      }
    });
  }
  play() {
    /* do-nothing */
  }
  stop() {
    /* do-nothing */
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
    fs.readFile(this.path, (err, data) => {
      if (err) handler._onAssetError(this, err);
      else {
        this.script = data;
        handler._onAssetLoad(this);
      }
    });
  }

  execute(env) {
    const func = this._wrap();
    func(env);
    return env.module.exports;
  }

  _wrap() {
    window.RPGAtsumaru = {
      screenshot: { setScreenshotHandler: () => {}, setTweetMessage: () => {} },
    };
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
    fs.readFile(this.path, (err, data) => {
      if (err) handler._onAssetError(this, err);
      else {
        this.data = data;
        handler._onAssetLoad(this);
      }
    });
  }
}

// 参考 : pid-browser の HTMLImageAsset
class FileSystemImageAsset extends g.ImageAsset {
  _load(handler) {
    fs.readFile(this.path, (err, data) => {
      if (err) handler._onAssetError(this, err);
      else {
        const image = new window.Image();
        image.onload = () => {
          this.data = image;
          handler._onAssetLoad(this);
        };
        image.onerror = (err) => {
          console.log("error");
          handler._onAssetError(this, err);
        };
        image.src = "data:image/png;base64," + btoa(data);
      }
    });
  }

  asSurface() {
    if (!this._surface) {
      this._surface = new g.Surface(this.width, this.height, this.data);
    }
    return this._surface;
  }
}

class FileSystemResourceFactory extends pdi.ResourceFactory {
  createAudioAsset(id, assetPath, duration, system, loop, hint) {
    return new FileSystemAudioAsset(
      id,
      assetPath,
      duration,
      system,
      loop,
      hint
    );
  }

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

const createDriver = () => {
  const audio = new pdi.AudioPluginManager();
  audio.tryInstallPlugin([new pdi.WebAudioPlugin()]);
  return new gdr.GameDriver({
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
};

/**
 * g.Game インスタンスを生成
 */
const createGame = async (driver) => {
  await new Promise((resolve, reject) => {
    driver.initialize(
      {
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
      },
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
  driver.startGame();
  await new Promise((resolve) => {
    const id = setInterval(() => {
      const res = Object.keys(driver._game.assets);
      if (res.length > 0) {
        clearInterval(id);
        resolve();
      }
    }, 1000);
  });
  return driver._game;
};

class AkashicEngineEnvironment extends NodeEnvironment {
  driver = undefined;
  async setup() {
    // g.game インスタンスを生成しておく
    await super.setup();
    // window を定義
    this.global.window = window;
    this.global.document = window.document;
    this.global.g = g;
    this.driver = createDriver();
    g.game = await createGame(this.driver);
  }

  runScript(script) {
    return super.runScript(script);
  }

  async teardown() {
    // 下記のエラーの対策。原因不明
    // TypeError: 'set' on proxy: trap returned falsish for property 'Symbol(impl)'
    await new Promise((resolve) => setTimeout(() => resolve(), 1000));
    if (this.driver) {
      try {
        await this.driver.destroy();
      } catch (e) {
        // 無視
        // console.trace(e);
      }
    }
    delete this.global.g;
    delete this.global.document;
    await super.teardown();
  }
}

module.exports = AkashicEngineEnvironment;
