import { createLoadedScene } from "../_helper/scene";
import createCityViewer from "entities/cityviewer";
import modelListener from "models/listener";
import cityResource from "models/city_resource";
import random from "utils/random";
import Human from "models/human";

declare const recreateGame: () => void;

const WIDTH = 800;
const HEIGHT = 640;
const seed = 2;

describe("cityviewer", () => {
  let hs: Human[];
  let scene: g.Scene;
  beforeEach(async () => {
    scene = await createLoadedScene(g.game);
    random.init(new g.XorshiftRandomGenerator(seed));
    hs = [];
    modelListener.human.register({
      onDone: (h) => hs.push(h),
      onDelete: () => {},
    });
  });

  afterEach(() => {
    modelListener.human._unregisterAll();
    modelListener.flush();
    recreateGame();
  });

  it("initializing city creates panel", () => {
    const panel = createCityViewer(scene);
    expect(panel.children.length).toEqual(1);
    const obj = cityResource.init(WIDTH, HEIGHT);
    expect(panel.children.length).toEqual(3);
    const residence = panel.children[2];
    const rPanel = residence.children[0];
    expect(residence.x + rPanel.width / 2).toEqual(obj.residence.x);
    expect(residence.y + rPanel.height / 2).toEqual(obj.residence.y);
    const company = panel.children[1];
    const cPanel = company.children[0];
    expect(company.x + cPanel.width / 2).toEqual(obj.company.x);
    expect(company.y + cPanel.height / 2).toEqual(obj.company.y);
  });

  it("human creates panel", () => {
    const panel = createCityViewer(scene);
    const obj = cityResource.init(WIDTH, HEIGHT);
    obj.residence._step(6);
    modelListener.done();
    expect(panel.children.length).toEqual(4);
    const human = panel.children[3];
    const hPanel = human.children[0];
    expect(human.x + hPanel.width / 2).toEqual(hs[0]._getVector().x);
    expect(human.y + hPanel.height / 2).toEqual(hs[0]._getVector().y);
  });
});
