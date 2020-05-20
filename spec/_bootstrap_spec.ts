import { RPGAtsumaruWindow } from "parameterObject";
import random from "utils/random";
import ticker from "utils/ticker";
import bootstrap = require("_bootstrap");

const ENDING = 10;

declare const window: RPGAtsumaruWindow;

/**
 * _bootstrap は Akashic Engine が用意したファイルなので、
 * カバレッジのため通している
 */
describe("_bootstrap", () => {
  it("with empty", () => {
    bootstrap({});
    const scene = g.game.scene();
    expect(scene).not.toBeUndefined();
  });

  it("with arguments", () => {
    bootstrap({ args: "foo" });
    const scene = g.game.scene();
    expect(scene).not.toBeUndefined();
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
    expect(g.game.scene()).not.toBeUndefined();
  });

  it("load main scene by firing message", () => {
    const TOTAL = 180;
    const SEED = 100;
    bootstrap({});
    expect(g.game.scene()).not.toBeUndefined();
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
    expect(g.game.scene()).not.toBeUndefined();
    expect(ticker.getRemainGameTime()).toEqual(TOTAL - ENDING);
    expect(random.random().seed).toEqual(SEED);
  });

  it("load main scene without random seed by firing message", () => {
    const TOTAL = 180;
    bootstrap({});
    expect(g.game.scene()).not.toBeUndefined();
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
    expect(g.game.scene()).not.toBeUndefined();
    expect(ticker.getRemainGameTime()).toEqual(TOTAL - ENDING);
    expect(random.random()).not.toBeNull();
  });

  it("with atsumaru", () => {
    bootstrap({});
    const scene = g.game.scene();
    expect(scene).not.toBeUndefined();
    scene.message.fire(
      new g.MessageEvent({
        type: "start",
        parameters: { totalTimeLimit: 0, randomSeed: 0 },
      })
    );
    g.game.tick(false);
    expect(g.game.scene()).not.toBeUndefined();
    g.game.tick(false);
    expect(g.game.scene()).not.toEqual(scene);
  });
});
