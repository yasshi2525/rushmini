import { RPGAtsumaruWindow } from "parameterObject";
import bootstrap = require("_bootstrap");
import ticker from "utils/ticker";
import random from "utils/random";

const ENDING = 10;

declare const recreateGame: () => void;
declare const window: RPGAtsumaruWindow;

/**
 * _bootstrap は Akashic Engine が用意したファイルなので、
 * カバレッジのため通している
 */
describe("_bootstrap", () => {
  afterEach(() => {
    recreateGame();
  });

  it("with empty", () => {
    bootstrap({});
    const scene = g.game.scene();
    expect(scene).toBeUndefined();
  });

  it("with arguments", () => {
    bootstrap({ args: "foo" });
    const scene = g.game.scene();
    expect(scene).toBeUndefined();
  });

  it("with atsumaru", () => {
    (<any>window).RPGAtsumaru = true;
    bootstrap({});
    const scene = g.game.scene();
    expect(scene).toBeUndefined();
  });

  it("load bootstrap scene by ticking", () => {
    bootstrap({});
    g.game.tick(false);
    expect(g.game.scene()).not.toBeUndefined();
  });

  it("load main scene by forcefully with any message", () => {
    bootstrap({});
    g.game.tick(false);
    let scene = g.game.scene();
    expect(scene).not.toBeUndefined();
    expect(scene.name).not.toEqual("title");
    scene.message.fire(new g.MessageEvent({}));
    g.game.tick(false);
    g.game.tick(false);
    g.game.tick(false);
    g.game.tick(false);
    scene = g.game.scene();
    expect(scene.name).toEqual("title");
  });

  it("load main scene by firing message", () => {
    const TOTAL = 180;
    const SEED = 100;
    bootstrap({});
    expect(g.game.scene()).toBeUndefined();
    g.game.tick(false);
    let scene = g.game.scene();
    expect(g.game.scene()).not.toBeUndefined();
    scene.message.fire(
      new g.MessageEvent({
        type: "start",
        parameters: { totalTimeLimit: TOTAL, randomSeed: SEED },
      })
    );
    g.game.tick(false);
    scene = g.game.scene();
    expect(scene.name).toEqual("title");
    expect(ticker.getRemainGameTime()).toEqual(TOTAL - ENDING);
    expect(random.random().seed).toEqual(SEED);
  });

  it("load main scene without random seed by firing message", () => {
    const TOTAL = 180;
    bootstrap({});
    expect(g.game.scene()).toBeUndefined();
    g.game.tick(false);
    let scene = g.game.scene();
    expect(g.game.scene()).not.toBeUndefined();
    scene.message.fire(
      new g.MessageEvent({
        type: "start",
        parameters: { totalTimeLimit: TOTAL },
      })
    );
    g.game.tick(false);
    scene = g.game.scene();
    expect(scene.name).toEqual("title");
    expect(ticker.getRemainGameTime()).toEqual(TOTAL - ENDING);
    expect(random.random()).toBeNull();
  });
});
