import createTitleScene from "scenes/title";
import ticker from "utils/ticker";

declare const recreateGame: () => Promise<void>;
const FPS = 60;

describe("title", () => {
  beforeEach(() => {
    ticker.init(FPS);
  });

  afterEach(async () => {
    await recreateGame();
  });

  it("create scene", () => {
    const obj = createTitleScene();
    expect(obj.scene).not.toBeUndefined();
    expect(obj.scene.name).toEqual("title");
  });

  it("load title scene", () => {
    const mockScene = new g.Scene({
      game: g.game,
      name: "mock",
    });
    const obj = createTitleScene();
    obj.prepare(mockScene);
    g.game.pushScene(obj.scene);
    // just register
    expect(obj.scene.isCurrentScene()).toBeFalsy();
    // change to main scene
    g.game.tick(false);
    expect(obj.scene.isCurrentScene()).toBeTruthy();
    expect(g.game.scene()).not.toBeUndefined();
    expect(g.game.scene()).toEqual(obj.scene);
  });

  it("point down change to next scene", () => {
    const mockScene = new g.Scene({
      game: g.game,
      name: "mock",
    });
    const obj = createTitleScene();
    obj.prepare(mockScene);
    g.game.pushScene(obj.scene);
    g.game.tick(false);
    expect(g.game.scene()).toEqual(obj.scene);
    obj.scene.children[0].pointDown.fire();
    expect(g.game.scene()).toEqual(obj.scene);
    g.game.tick(false);
    expect(g.game.scene()).toEqual(mockScene);
    expect(mockScene.isCurrentScene()).toBeTruthy();
  });
});
