import { RPGAtsumaruWindow } from "parameterObject";
import createEndingScene from "scenes/ending";

declare const recreateGame: () => Promise<void>;
declare const window: RPGAtsumaruWindow;

describe("ending", () => {
  beforeEach(() => {
    window.RPGAtsumaru = {
      scoreboards: {
        setRecord: (_id: number, _score: number) =>
          new Promise<void>((resolve) => resolve()),
        display: (_: number): any => undefined,
      },
    };
    const state = { score: 0 };
    g.game.vars.gameState = state;
  });

  afterEach(async () => {
    await recreateGame();
  });

  it("create scene", () => {
    const obj = createEndingScene(false);
    expect(obj.scene.name).toEqual("ending");
  });

  it("load scene", () => {
    const obj = createEndingScene(false);
    const mock = new g.Scene({ game: g.game });
    obj.prepare(mock);
    g.game.pushScene(obj.scene);
    g.game.tick(false);
    expect(g.game.scene().name).toEqual("ending");
  });

  it("replay button changes scene", () => {
    const obj = createEndingScene(true);
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
