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
  let h: Human;
  let c: Company;
  let r: Residence;
  let re: RailEdge;
  let st: Station;
  let t: Train;

  beforeEach(async () => {
    scene = await createLoadedScene(true);
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
    const panel = createModelViewer(scene);
    expect(panel.children.length).toEqual(6);
  });

  it("layer 1. residence", () => {
    const panel = createModelViewer(scene).children[0];
    modelListener.fire(EventType.CREATED);
    expect(panel.children.length).toEqual(1);

    const pos = panel.children[0];
    expect(pos.x).toEqual(6);
    expect(pos.y).toEqual(8);
    expect(pos.width).toEqual(512);
    expect(pos.height).toEqual(512);
    expect(pos.children.length).toEqual(1);

    const sprite = pos.children[0];
    expect(sprite.x).toEqual(0);
    expect(sprite.y).toEqual(0);
    expect(sprite.scaleX).toEqual(0.25);
    expect(sprite.scaleY).toEqual(0.25);
    expect(sprite.width).toEqual(512);
    expect(sprite.height).toEqual(512);
  });

  it("layer 2. company", () => {
    const panel = createModelViewer(scene).children[1];
    modelListener.fire(EventType.CREATED);
    expect(panel.children.length).toEqual(1);

    const pos = panel.children[0];
    expect(pos.x).toEqual(3);
    expect(pos.y).toEqual(4);
    expect(pos.width).toEqual(512);
    expect(pos.height).toEqual(512);
    expect(pos.children.length).toEqual(1);

    const sprite = pos.children[0];
    expect(sprite.x).toEqual(0);
    expect(sprite.y).toEqual(0);
    expect(sprite.scaleX).toEqual(0.25);
    expect(sprite.scaleY).toEqual(0.25);
    expect(sprite.width).toEqual(512);
    expect(sprite.height).toEqual(512);
  });

  it("layer 3. human", () => {
    const panel = createModelViewer(scene).children[2];
    modelListener.fire(EventType.CREATED);
    expect(panel.children.length).toEqual(1);

    const pos = panel.children[0];
    expect(pos.x).toEqual(6);
    expect(pos.y).toEqual(8);
    expect(pos.width).toEqual(512);
    expect(pos.height).toEqual(512);
    expect(pos.children.length).toEqual(1);

    const sprite = pos.children[0];
    expect(sprite.x).toEqual(0);
    expect(sprite.y).toEqual(0);
    expect(sprite.scaleX).toEqual(0.125);
    expect(sprite.scaleY).toEqual(0.125);
    expect(sprite.width).toEqual(512);
    expect(sprite.height).toEqual(512);
  });

  it("layer 3. human on train is hidden", () => {
    const panel = createModelViewer(scene).children[2];
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
    const panel = createModelViewer(scene).children[3];
    modelListener.fire(EventType.CREATED);
    expect(panel.children.length).toEqual(2);

    const pos = panel.children[0];
    expect(pos.x).toEqual(10);
    expect(pos.y).toEqual(13);
    expect(pos.children.length).toEqual(1);

    const rect = pos.children[0];
    expect(rect.y).toEqual(-2.5);
    expect(rect.width).toBeCloseTo(2 * Math.sqrt(2) + 2.5);
    expect(rect.height).toEqual(5);
    expect((rect as g.FilledRect).cssColor).toEqual("#aaaaaa");
  });

  it("layer 5. station", () => {
    const panel = createModelViewer(scene).children[4];
    modelListener.fire(EventType.CREATED);
    expect(panel.children.length).toEqual(1);

    const pos = panel.children[0];
    expect(pos.x).toEqual(9);
    expect(pos.y).toEqual(12);
    expect(pos.width).toEqual(512);
    expect(pos.height).toEqual(512);
    expect(pos.children.length).toEqual(1);

    const sprite = pos.children[0];
    expect(sprite.x).toEqual(0);
    expect(sprite.y).toEqual(0);
    expect(sprite.scaleX).toEqual(0.25);
    expect(sprite.scaleY).toEqual(0.25);
    expect(sprite.width).toEqual(512);
    expect(sprite.height).toEqual(512);
  });

  it("layer 6. train", () => {
    const panel = createModelViewer(scene).children[5];
    modelListener.fire(EventType.CREATED);
    expect(panel.children.length).toEqual(1);

    const pos = panel.children[0];
    expect(pos.x).toEqual(9);
    expect(pos.y).toEqual(12);
    expect(pos.width).toEqual(512);
    expect(pos.height).toEqual(512);
    expect(pos.children.length).toEqual(1);

    const sprite = pos.children[0];
    expect(sprite.x).toEqual(0);
    expect(sprite.y).toEqual(0);
    expect(sprite.scaleX).toEqual(0.125);
    expect(sprite.scaleY).toEqual(0.125);
    expect(sprite.width).toEqual(512);
    expect(sprite.height).toEqual(512);
  });
});
