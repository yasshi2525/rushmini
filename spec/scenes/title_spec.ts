import createTitleScene from "scenes/title";
import scenes, { SceneType } from "utils/scene";
import ticker from "utils/ticker";

const FPS = 60;

describe("title", () => {
  beforeEach(() => {
    ticker.init(FPS);
  });

  afterEach(() => {
    scenes.reset();
  });

  it("create scene", () => {
    const scene = createTitleScene();
    expect(scene).not.toBeUndefined();
  });

  it("load title scene", () => {
    const scene = createTitleScene();
    g.game.pushScene(scene);
    // just register
    expect(scene.isCurrentScene()).toBeFalsy();
    // change to main scene
    g.game.tick(false);
    expect(scene.isCurrentScene()).toBeTruthy();
    expect(g.game.scene()).not.toBeUndefined();
    expect(g.game.scene()).toEqual(scene);
    expect(scenes.isMute).toBeFalsy();
  });

  it("point down change to next scene", () => {
    scenes.put(SceneType.INSTRUCTION, () => new g.Scene({ game: g.game }));
    const scene = createTitleScene();
    g.game.pushScene(scene);
    g.game.tick(false);
    expect(g.game.scene()).toEqual(scene);
    scene.pointUpCapture.fire();
    expect(g.game.scene()).toEqual(scene);
    g.game.tick(false);
    expect(g.game.scene()).not.toEqual(scene);
    expect(scenes.isMute).toBeFalsy();
  });

  it("do nothing 6 seconds changes to next scene", () => {
    scenes.put(SceneType.INSTRUCTION, () => new g.Scene({ game: g.game }));
    const scene = createTitleScene();
    g.game.pushScene(scene);
    g.game.tick(false);
    expect(g.game.scene()).toEqual(scene);
    for (let i = 0; i < 6 * ticker.fps() + 1; i++) {
      g.game.tick(true);
      expect(g.game.scene()).toEqual(scene);
    }
    g.game.tick(false);
    expect(g.game.scene()).not.toEqual(scene);
    expect(scenes.isMute).toBeFalsy();
  });

  it("toggle mute", () => {
    const scene = createTitleScene();
    g.game.pushScene(scene);
    g.game.tick(false);
    scene.children[1].children[0].pointUp.fire();
    expect(scenes.isMute).toBeTruthy();
    scene.children[1].children[1].pointUp.fire();
    expect(scenes.isMute).toBeFalsy();
    expect(g.game.scene()).toEqual(scene);
  });
});
