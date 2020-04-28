import createCityBuilder from "entities/citybuilder";
import cityResource from "models/city_resource";
import Company from "models/company";
import Human from "models/human";
import modelListener, { EventType } from "models/listener";
import Residence from "models/residence";
import random from "utils/random";
import scorer from "utils/scorer";
import ticker from "utils/ticker";
import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => void;
const WIDTH = 100;
const HEIGHT = 100;
const FPS = 15;

const oldInterval = Residence.INTERVAL_SEC;

afterAll(() => {
  Residence.INTERVAL_SEC = oldInterval;
  ticker.reset();
});

describe("citybuilder", () => {
  let scene: g.Scene;
  let rs: Residence[];
  let cs: Company[];
  let hs: Human[];

  beforeEach(async () => {
    random.init(new g.XorshiftRandomGenerator(1));
    Residence.INTERVAL_SEC = 1;
    scene = await createLoadedScene(g.game);
    ticker.init(FPS);
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
    recreateGame();
    modelListener.unregisterAll();
    modelListener.flush();
  });

  it("create residence and company in zero tick", () => {
    expect(rs.length).toEqual(1);
    expect(cs.length).toEqual(1);
    expect(hs.length).toEqual(0);
  });
});
