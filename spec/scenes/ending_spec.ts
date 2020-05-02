import createEndingScene from "scenes/ending";

declare const recreateGame: () => Promise<void>;

describe("ending", () => {
  afterEach(async () => {
    await recreateGame();
  });

  it("create scene", () => {
    const obj = createEndingScene();
    expect(obj.scene.name).toEqual("ending");
  });

  it("load scene", () => {
    const obj = createEndingScene();
    const mock = new g.Scene({ game: g.game });
    obj.prepare(mock);
    g.game.pushScene(obj.scene);
    g.game.tick(false);
    expect(g.game.scene().name).toEqual("ending");
  });

  it("replay button changes scene", () => {
    const obj = createEndingScene();
    const mock = new g.Scene({ game: g.game, name: "mock" });
    obj.prepare(mock);
    g.game.pushScene(obj.scene);
    g.game.tick(false);
    expect(g.game.scene().name).toEqual("ending");
    g.game.scene().children[0].pointDown.fire();
    g.game.scene().children[0].pointUp.fire();
    g.game.tick(false);
    expect(g.game.scene().name).toEqual("mock");
  });
});
