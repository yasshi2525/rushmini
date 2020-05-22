import createInstructionScene from "scenes/instruction";
import scenes, { SceneType } from "utils/scene";
import ticker from "utils/ticker";

const FPS = 60;

describe("instruction", () => {
  beforeEach(() => {
    ticker.init(FPS);
  });

  afterEach(() => {
    scenes.reset();
  });

  it("create scene", () => {
    const scene = createInstructionScene();
    expect(scene).not.toBeUndefined();
  });

  it("load instruction scene", () => {
    const scene = createInstructionScene();
    g.game.pushScene(scene);
    // just register
    expect(scene.isCurrentScene()).toBeFalsy();
    // change to instruction scene
    g.game.tick(false);
    expect(scene.isCurrentScene()).toBeTruthy();
    expect(g.game.scene()).not.toBeUndefined();
    expect(g.game.scene()).toEqual(scene);
  });

  it("point down change to next scene", () => {
    scenes.put(SceneType.GAME, () => new g.Scene({ game: g.game }));
    const scene = createInstructionScene();
    g.game.pushScene(scene);
    g.game.tick(false);
    expect(g.game.scene()).toEqual(scene);
    scene.pointUpCapture.fire();
    expect(g.game.scene()).toEqual(scene);
    g.game.tick(false);
    expect(g.game.scene()).not.toEqual(scene);
  });

  it("do nothing 15 seconds changes to next scene", () => {
    scenes.put(SceneType.GAME, () => new g.Scene({ game: g.game }));
    const scene = createInstructionScene();
    g.game.pushScene(scene);
    g.game.tick(false);
    expect(g.game.scene()).toEqual(scene);
    for (let i = 0; i < 15 * ticker.fps() + 1; i++) {
      g.game.tick(true);
      expect(g.game.scene()).toEqual(scene);
    }
    g.game.tick(false);
    expect(g.game.scene()).not.toEqual(scene);
  });
});
