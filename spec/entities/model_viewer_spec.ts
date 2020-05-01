import createModelViewer from "entities/model_viewer";
import Company from "models/company";
import Human from "models/human";
import modelListener, { EventType } from "models/listener";
import RailEdge from "models/rail_edge";
import RailLine from "models/rail_line";
import RailNode from "models/rail_node";
import Residence from "models/residence";
import Station from "models/station";
import Train from "models/train";
import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => void;

const WIDTH = 800;
const HEIGHT = 640;
const seed = 0;

const B = 4;

describe("model_viewer", () => {
  let scene: g.Scene;
  let h: Human;
  let c: Company;
  let r: Residence;
  let re: RailEdge;
  let st: Station;
  let t: Train;

  beforeEach(async () => {
    scene = await createLoadedScene(g.game);
    c = new Company(1, 3, 4);
    r = new Residence([c], 6, 8);
    h = new Human(r, c);
    const rn = new RailNode(9, 12);
    re = rn._extend(11, 14);
    const p = rn._buildStation();
    st = p.station;
    const l = new RailLine();
    l._start(p);
    t = new Train(l.top);
  });

  afterEach(() => {
    modelListener.unregisterAll();
    modelListener.flush();
    recreateGame();
  });

  it("panel has 6 type panel", () => {
    const panel = createModelViewer(scene);
    expect(panel.children.length).toEqual(6);
  });

  it("layer 1. human", () => {
    const panel = createModelViewer(scene);
    modelListener.fire(EventType.CREATED);
    const human = panel.children[0].children[0];
    expect(human.x).toEqual(6 - 2 - B);
    expect(human.y).toEqual(8 - 4 - B);
    expect((human.children[0].children[0] as g.FilledRect).cssColor).toEqual(
      "#800000"
    );
  });

  it("layer 2. residence", () => {
    const panel = createModelViewer(scene);
    modelListener.fire(EventType.CREATED);
    const residence = panel.children[1].children[0];
    expect(residence.x).toEqual(6 - 5 - B);
    expect(residence.y).toEqual(8 - 5 - B);
    expect(
      (residence.children[0].children[0] as g.FilledRect).cssColor
    ).toEqual("#cd5c5c");
  });

  it("layer 3. company", () => {
    const panel = createModelViewer(scene);
    modelListener.fire(EventType.CREATED);
    const company = panel.children[2].children[0];
    expect(company.x).toEqual(3 - 5 - B);
    expect(company.y).toEqual(4 - 5 - B);
    expect((company.children[0].children[0] as g.FilledRect).cssColor).toEqual(
      "#4169e1"
    );
  });
  it("layer 4. rail_edge", () => {
    const panel = createModelViewer(scene);
    modelListener.fire(EventType.CREATED);
    const rail_edge = panel.children[3].children[0];
    expect(rail_edge.x).toEqual(10 - 2.5 + 1.25 - Math.sqrt(2));
    expect(rail_edge.y).toEqual(11 - 0.5);
    expect((rail_edge.children[0] as g.FilledRect).cssColor).toEqual("#aaaaaa");
  });

  it("layer 5. station", () => {
    const panel = createModelViewer(scene);
    modelListener.fire(EventType.CREATED);
    const station = panel.children[4].children[0];
    expect(station.x).toEqual(9 - 10 - B);
    expect(station.y).toEqual(12 - 10 - B);
    expect((station.children[0].children[0] as g.FilledRect).cssColor).toEqual(
      "#32cd32"
    );
  });

  it("layer 6. train", () => {
    const panel = createModelViewer(scene);
    modelListener.fire(EventType.CREATED);
    const train = panel.children[5].children[0];
    expect(train.x).toEqual(9 - 20 - B);
    expect(train.y).toEqual(12 - 4 - B);
    expect((train.children[0].children[0] as g.FilledRect).cssColor).toEqual(
      "#ee82ee"
    );
  });
});
