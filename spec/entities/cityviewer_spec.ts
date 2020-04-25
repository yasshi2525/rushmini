import { createLoadedScene } from "../_helper/scene";
import createCityViewer from "entities/cityviewer";
import modelListener, { EventType } from "models/listener";
import cityResource from "models/city_resource";
import random from "utils/random";
import Human from "models/human";
import Residence from "models/residence";
import Company from "models/company";

declare const recreateGame: () => void;

const WIDTH = 800;
const HEIGHT = 640;
const seed = 0;

describe("cityviewer", () => {
  let rs: Residence[];
  let cs: Company[];
  let hs: Human[];
  let scene: g.Scene;
  let rand: (min: number, max: number) => number;

  beforeEach(async () => {
    scene = await createLoadedScene(g.game);
    random.init(new g.XorshiftRandomGenerator(seed));
    rand = (min, max) => random.random().get(min, max);
    rs = [];
    cs = [];
    hs = [];
    modelListener
      .find(EventType.CREATED, Residence)
      .register((r) => rs.push(r));
    modelListener.find(EventType.CREATED, Company).register((c) => cs.push(c));
    modelListener.find(EventType.CREATED, Human).register((h) => hs.push(h));
  });

  afterEach(() => {
    cityResource.reset();
    modelListener.unregisterAll();
    modelListener.flush();
    recreateGame();
  });

  it("initializing city creates panel", () => {
    const panel = createCityViewer(scene);
    expect(panel.children.length).toEqual(1);
    cityResource.init(WIDTH, HEIGHT, rand);
    expect(panel.children.length).toEqual(3);
    const residence = panel.children[1];
    const rPanel = residence.children[0];
    expect(residence.x + rPanel.width / 2).toEqual(rs[0].x);
    expect(residence.y + rPanel.height / 2).toEqual(rs[0].y);
    const company = panel.children[2];
    const cPanel = company.children[0];
    expect(company.x + cPanel.width / 2).toEqual(cs[0].x);
    expect(company.y + cPanel.height / 2).toEqual(cs[0].y);
  });

  it("human creates panel", () => {
    const panel = createCityViewer(scene);
    cityResource.init(WIDTH, HEIGHT, rand);
    rs[0]._step(6);
    modelListener.fire(EventType.CREATED);
    expect(panel.children.length).toEqual(4);
    const human = panel.children[3];
    const hPanel = human.children[0];
    expect(human.x + hPanel.width / 2).toEqual(hs[0]._getVector().x);
    expect(human.y + hPanel.height / 2).toEqual(hs[0]._getVector().y);
  });
});
