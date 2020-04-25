import { createLoadedScene } from "../_helper/scene";
import ticker from "utils/ticker";
import scorer from "utils/scorer";
import Residence from "models/residence";
import Human from "models/human";
import Company from "models/company";
import modelListener, { EventType } from "models/listener";
import createCityBuilder from "entities/citybuilder";
import random from "utils/random";
import cityResource from "models/city_resource";

declare const recreateGame: () => void;
const WIDTH = 100;
const HEIGHT = 100;
const FPS = 15;
const GAME = 60;
const ENDING = 10;

const oldFPS = Residence.FPS;
const oldInterval = Residence.INTERVAL_SEC;

afterAll(() => {
  Residence.INTERVAL_SEC = oldInterval;
  Residence.FPS = oldFPS;
});

describe("citybuilder", () => {
  let scene: g.Scene;
  let rs: Residence[];
  let cs: Company[];
  let hs: Human[];

  beforeEach(async () => {
    random.init(new g.XorshiftRandomGenerator(1));
    Residence.INTERVAL_SEC = 1;
    Residence.FPS = FPS;
    scene = await createLoadedScene(g.game);
    ticker.init(FPS, GAME + ENDING);
    scorer.init({ score: 0 });
    rs = [];
    cs = [];
    hs = [];
    modelListener
      .find(EventType.CREATED, Residence)
      .register((r) => rs.push(r));
    modelListener.find(EventType.CREATED, Company).register((c) => cs.push(c));
    modelListener.find(EventType.CREATED, Human).register((h) => hs.push(h));
    createCityBuilder(new g.E({ scene, width: WIDTH, height: HEIGHT }));
  });

  afterEach(() => {
    cityResource.reset();
    recreateGame();
    modelListener.unregisterAll();
    modelListener.flush();
  });

  it("create residence and company in zero tick", () => {
    expect(rs.length).toEqual(1);
    expect(cs.length).toEqual(1);
    expect(hs.length).toEqual(0);
  });

  it("ticking FPS frame creates one human", () => {
    for (let i = 0; i < FPS - 1; i++) {
      ticker.step();
      expect(hs.length).toEqual(0);
    }
    ticker.step();
    expect(hs.length).toEqual(1);
  });

  it("ticking moves human", () => {
    let moveCount = 0;
    modelListener.find(EventType.MODIFIED, Human).register((h) => {
      if (hs[0] === h) {
        moveCount++;
      }
    });
    for (let i = 0; i < FPS - 1; i++) {
      ticker.step();
      expect(moveCount).toEqual(0);
    }
    ticker.step();
    expect(moveCount).toEqual(1);
  });
});
