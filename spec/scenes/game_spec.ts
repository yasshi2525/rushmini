import createGameScene from "scenes/game";
import ticker from "utils/ticker";
import scorer from "utils/scorer";
import random from "utils/random";

declare const recreateGame: () => void;
const FPS = 15;
const GAME = 30;
const ENDING = 10;

describe("game", () => {
  beforeEach(() => {
    random.init(new g.XorshiftRandomGenerator(0));
    ticker.init(FPS, GAME + ENDING);
    scorer.init({ score: 0 });
  });

  afterEach(() => {
    recreateGame();
  });

  it("create scene", () => {
    const obj = createGameScene();
    expect(obj.scene.name).toEqual("game");
  });

  it("load scene", () => {
    const obj = createGameScene();
    const mock = new g.Scene({ game: g.game });
    obj.prepare(mock);
    g.game.pushScene(obj.scene);
    g.game.tick(false);
    expect(g.game.scene().name).toEqual("game");
  });

  it("game over changes scene", () => {
    const obj = createGameScene();
    const mock = new g.Scene({ game: g.game, name: "mock" });
    obj.prepare(mock);
    g.game.pushScene(obj.scene);
    g.game.tick(false);
    expect(g.game.scene().name).toEqual("game");
    expect(ticker.getRemainGameTime()).toEqual(GAME);
    for (let i = 0; i < FPS * GAME - 1; i++) {
      g.game.tick(true);
      expect(g.game.scene().name).toEqual("game");
    }
    g.game.tick(true);
    expect(g.game.scene().name).toEqual("mock");
  });
});
