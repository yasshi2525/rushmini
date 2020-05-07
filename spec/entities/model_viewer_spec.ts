import createModelViewer from "entities/model_viewer";
import Company from "models/company";
import Human, { HumanState } from "models/human";
import modelListener, { EventType } from "models/listener";
import RailEdge from "models/rail_edge";
import RailLine from "models/rail_line";
import RailNode from "models/rail_node";
import Residence from "models/residence";
import Station from "models/station";
import Train from "models/train";
import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => Promise<void>;

const WIDTH = 800;
const HEIGHT = 640;
const seed = 0;

const B = 4;

describe("model_viewer", () => {
  let scene: g.Scene;
  let base: g.E;
  let h: Human;
  let c: Company;
  let r: Residence;
  let re: RailEdge;
  let st: Station;
  let t: Train;

  beforeEach(async () => {
    scene = await createLoadedScene(true);
    base = createModelViewer(scene).children[0].children[0];
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

  afterEach(async () => {
    modelListener.unregisterAll();
    modelListener.flush();
    await recreateGame();
  });

  it("panel has 6 type panel", () => {
    expect(base.children.length).toEqual(6);
  });

  it("layer 1. residence", () => {
    const panel = base.children[0];
    modelListener.fire(EventType.CREATED);
    expect(panel.children.length).toEqual(1);

    const pos = panel.children[0];
    expect(pos.x).toEqual(6 - pos.width / 2);
    expect(pos.y).toEqual(8 - pos.height / 2);
    expect(pos.children.length).toEqual(1);

    const sprite = pos.children[0];
    expect(sprite.x).toEqual(0);
    expect(sprite.y).toEqual(0);
    expect(sprite.scaleX).toEqual(1);
    expect(sprite.scaleY).toEqual(1);
  });

  it("layer 2. company", () => {
    const panel = base.children[1];
    modelListener.fire(EventType.CREATED);
    expect(panel.children.length).toEqual(1);

    const pos = panel.children[0];
    expect(pos.x).toEqual(3 - pos.width / 2);
    expect(pos.y).toEqual(4 - pos.height / 2);
    expect(pos.children.length).toEqual(1);

    const sprite = pos.children[0];
    expect(sprite.x).toEqual(0);
    expect(sprite.y).toEqual(0);
    expect(sprite.scaleX).toEqual(1);
    expect(sprite.scaleY).toEqual(1);
  });

  it("layer 3. human", () => {
    const panel = base.children[2];
    modelListener.fire(EventType.CREATED);
    expect(panel.children.length).toEqual(1);

    const pos = panel.children[0];
    expect(pos.x).toEqual(6 - pos.width / 2);
    expect(pos.y).toEqual(8 - pos.height / 2);
    expect(pos.children.length).toEqual(1);

    const sprite = pos.children[0];
    expect(sprite.x).toEqual(0);
    expect(sprite.y).toEqual(0);
    expect(sprite.scaleX).toEqual(1);
    expect(sprite.scaleY).toEqual(1);
  });

  it("layer 3. human on train is hidden", () => {
    const panel = base.children[2];
    modelListener.fire(EventType.CREATED);
    expect(panel.children.length).toEqual(1);

    const pos = panel.children[0];
    expect(pos.visible()).toBeTruthy();

    h.state(HumanState.ON_TRAIN);
    modelListener.fire(EventType.MODIFIED, h);
    expect(pos.visible()).toBeFalsy();

    h.state(HumanState.MOVE);
    modelListener.fire(EventType.MODIFIED, h);
    expect(pos.visible()).toBeTruthy();
  });

  it("layer 4. rail_edge", () => {
    const panel = base.children[3];
    modelListener.fire(EventType.CREATED);
    modelListener.fire(EventType.MODIFIED);
    expect(panel.children.length).toEqual(2);

    const pos = panel.children[0];
    expect(pos.x).toEqual(10 - pos.width / 2);
    expect(pos.y).toEqual(13 - pos.height / 2);
    expect(pos.children.length).toEqual(1);

    const rect = pos.children[0];
    expect(rect.x).toEqual(0);
    expect(rect.y).toEqual(0);
    expect((rect.children[0] as g.FilledRect).cssColor).toEqual("#aaaaaa");
  });

  it("layer 5. station", () => {
    const panel = base.children[4];
    modelListener.fire(EventType.CREATED);
    expect(panel.children.length).toEqual(1);

    const pos = panel.children[0];
    expect(pos.x).toEqual(9 - pos.width / 2);
    expect(pos.y).toEqual(12 - pos.height / 2);
    expect(pos.children.length).toEqual(1);

    const sprite = pos.children[0];
    expect(sprite.x).toEqual(0);
    expect(sprite.y).toEqual(0);
    expect(sprite.scaleX).toEqual(1);
    expect(sprite.scaleY).toEqual(1);
  });

  it("layer 6. train", () => {
    const panel = base.children[5];
    modelListener.fire(EventType.CREATED);
    expect(panel.children.length).toEqual(1);

    const pos = panel.children[0];
    expect(pos.x).toEqual(9 - pos.width / 2);
    expect(pos.y).toEqual(12 - pos.height / 2);
    expect(pos.children.length).toEqual(1);

    const sprite = pos.children[0];
    expect(sprite.x).toEqual(0);
    expect(sprite.y).toEqual(0);
    expect(sprite.scaleX).toEqual(1);
    expect(sprite.scaleY).toEqual(1);
  });
});
