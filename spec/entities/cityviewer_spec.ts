import createCityViewer from "entities/cityviewer";
import cityResource from "models/city_resource";
import Company from "models/company";
import Human from "models/human";
import modelListener, { EventType } from "models/listener";
import { distance } from "models/pointable";
import Residence from "models/residence";
import random from "utils/random";
import { createLoadedScene } from "../_helper/scene";

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
    modelListener.unregisterAll();
    modelListener.flush();
    recreateGame();
  });

  it("initializing city creates panel", () => {
    const panel = createCityViewer(scene);
    expect(panel.children).toBeUndefined();
    cityResource.init(WIDTH, HEIGHT, rand);
    expect(panel.children.length).toEqual(2);
    const residence = panel.children[0];
    const rPanel = residence.children[0];
    expect(residence.x + rPanel.width / 2).toEqual(rs[0].loc().x);
    expect(residence.y + rPanel.height / 2).toEqual(rs[0].loc().y);
    const company = panel.children[1];
    const cPanel = company.children[0];
    expect(company.x + cPanel.width / 2).toEqual(cs[0].loc().x);
    expect(company.y + cPanel.height / 2).toEqual(cs[0].loc().y);
  });

  it("human creates panel", () => {
    const panel = createCityViewer(scene);
    cityResource.init(WIDTH, HEIGHT, rand);
    for (let j = 0; j < 6; j++) rs[0]._step();
    modelListener.fire(EventType.CREATED);
    expect(panel.children.length).toEqual(3);
    const human = panel.children[2];
    const hPanel = human.children[0];
    expect(human.x + hPanel.width / 2).toEqual(hs[0].loc().x);
    expect(human.y + hPanel.height / 2).toEqual(hs[0].loc().y);
  });

  it("human moving changes panel", () => {
    const panel = createCityViewer(scene);
    cityResource.init(WIDTH, HEIGHT, rand);
    rs[0]._setNext(cs[0], cs[0], distance(cs[0], rs[0]));
    for (let j = 0; j < 6; j++) rs[0]._step();
    modelListener.fire(EventType.CREATED);

    const human = panel.children[2];
    const hPanel = human.children[0];
    expect(panel.children.length).toEqual(3);
    expect(human.x + hPanel.width / 2).toEqual(hs[0].loc().x);
    expect(human.y + hPanel.height / 2).toEqual(hs[0].loc().y);
    hs[0]._step();
    modelListener.fire(EventType.MODIFIED);
    expect(human.x + hPanel.width / 2).toEqual(hs[0].loc().x);
    expect(human.y + hPanel.height / 2).toEqual(hs[0].loc().y);
  });
});
