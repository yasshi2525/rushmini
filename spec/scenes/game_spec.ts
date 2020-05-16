import Company from "models/company";
import Human from "models/human";
import modelListener, { EventType } from "models/listener";
import Residence from "models/residence";
import createGameScene from "scenes/game";
import random from "utils/random";
import scenes, { SceneType } from "utils/scene";
import scorer from "utils/scorer";
import ticker from "utils/ticker";
import viewer from "utils/viewer";

declare const recreateGame: () => Promise<void>;
const FPS = 15;
const GAME = 30;
const ENDING = 10;

describe("game", () => {
  beforeEach(() => {
    random.init(new g.XorshiftRandomGenerator(0));
    ticker.init(FPS, GAME + ENDING);
    scorer.init({ score: 0 });
  });

  afterEach(async () => {
    viewer.reset();
    scenes.reset();
    modelListener.flush();
    modelListener.unregisterAll();
    await recreateGame();
  });

  it("create scene", () => {
    const scene = createGameScene();
    expect(scene).not.toBeUndefined();
  });

  it("load scene", () => {
    const scene = createGameScene();
    g.game.pushScene(scene);
    g.game.tick(false);
    expect(g.game.scene()).toEqual(scene);
  });

  it("game over changes scene", () => {
    scenes.put(SceneType.ENDING, () => new g.Scene({ game: g.game }));
    const scene = createGameScene();
    g.game.pushScene(scene);
    g.game.tick(false);
    expect(g.game.scene()).toEqual(scene);
    expect(ticker.getRemainGameTime()).toEqual(GAME);
    for (let i = 0; i < FPS * GAME - 1; i++) {
      g.game.tick(true);
      expect(g.game.scene()).toEqual(scene);
    }
    g.game.tick(false);
    expect(g.game.scene()).not.toEqual(scene);
  });

  describe("init controller", () => {
    let rs: Residence[];
    let cs: Company[];
    let hs: Human[];

    beforeEach(() => {
      random.init(new g.XorshiftRandomGenerator(0));
      ticker.init(FPS);
      scorer.init({ score: 0 });
      Residence.INTERVAL_SEC = 1;
      rs = [];
      cs = [];
      hs = [];
      modelListener
        .find(EventType.CREATED, Residence)
        .register((r) => rs.push(r));
      modelListener
        .find(EventType.CREATED, Company)
        .register((c) => cs.push(c));
      modelListener.find(EventType.CREATED, Human).register((h) => hs.push(h));
    });

    it("create residence and company in zero tick", () => {
      const scene = createGameScene();
      g.game.pushScene(scene);
      g.game.tick(false);
      expect(rs.length).toEqual(1);
      expect(cs.length).toEqual(2);
      expect(hs.length).toEqual(0);
    });

    afterEach(async () => {
      scenes.reset();
      await recreateGame();
    });
  });
});
