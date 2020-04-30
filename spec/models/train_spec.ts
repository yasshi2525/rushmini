import Company from "models/company";
import DeptTask from "models/dept_task";
import Gate from "models/gate";
import Human, { HumanState } from "models/human";
import modelListener from "models/listener";
import Platform from "models/platform";
import { distance } from "models/pointable";
import RailEdge from "models/rail_edge";
import RailLine from "models/rail_line";
import RailNode from "models/rail_node";
import Residence from "models/residence";
import Train from "models/train";
import ticker from "utils/ticker";

const FPS = 15;
const STAY_SEC = 1;
const SPEED = 5;
const oldSPEED = Train.SPEED;
const oldSTAY = Train.STAY_SEC;

beforeAll(() => {
  ticker.init(FPS);
  Train.SPEED = SPEED;
  Train.STAY_SEC = STAY_SEC;
});

afterAll(() => {
  ticker.reset();
  Train.SPEED = oldSPEED;
  Train.STAY_SEC = oldSTAY;
  modelListener.flush();
});

describe("train", () => {
  let r: Residence;
  let c: Company;
  let h: Human;
  let rn1: RailNode;
  let g1: Gate;
  let p1: Platform;
  let e12: RailEdge;
  let rn2: RailNode;
  let g2: Gate;
  let p2: Platform;
  let l: RailLine;

  beforeEach(() => {
    Train.SPEED = SPEED;
    Train.STAY_SEC = STAY_SEC;
    c = new Company(1, 3, 4);
    r = new Residence([c], 0, 0);
    rn1 = new RailNode(0, 0);
    p1 = rn1._buildStation();
    g1 = p1.station.gate;
    e12 = rn1._extend(3, 4);
    rn2 = e12.to;
    p2 = rn2._buildStation();
    g2 = p2.station.gate;
    l = new RailLine();
    l._start(p1);
    l._insertEdge(e12);
    r._setNext(g1, c, distance(c, r));
    g1._setNext(p1, c, distance(c, g1));
    p1._setNext(l.top, c, distance(c, p1) / 10);
    l.top._setNext(p2, c, distance(c, p1) / 10);
    p2._setNext(g2, c, distance(c, g2));
    g2._setNext(c, c, distance(c, g2));
    h = new Human(r, c);
  });

  afterEach(() => {
    Train.SPEED = oldSPEED;
    Train.STAY_SEC = oldSTAY;
  });

  it("deploy", () => {
    const t = new Train(l.top);
    expect(t.loc()).toEqual(rn1.loc());
  });

  it("departure", () => {
    const t = new Train(l.top);
    for (let j = 0; j < FPS * STAY_SEC; j++) {
      t._step();
      expect(t.loc()).toEqual(rn1.loc());
    }
    t._step();
    expect(t.loc()).not.toEqual(rn1.loc());
  });

  it("move", () => {
    const t = new Train(l.top);
    for (let j = 0; j < FPS * STAY_SEC; j++) t._step();
    for (let j = 0; j < FPS; j++) t._step();
    expect(t.loc()).toEqual(rn2.loc());
  });

  it("human ride", () => {
    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_GATE);
    g1._step();
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_PLATFORM);
    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_TRAIN);
    h._step();
    const t = new Train(l.top);
    for (let j = 0; j < FPS * STAY_SEC; j++) {
      t._step();
      expect(h.state()).toEqual(HumanState.ON_TRAIN);
      expect(h.loc()).toEqual(rn1.loc());
    }
    for (let j = 0; j < FPS; j++) {
      t._step();
      expect(h.state()).toEqual(HumanState.ON_TRAIN);
    }
    t._step();
    expect(h.state()).toEqual(HumanState.WAIT_EXIT_PLATFORM);
    expect(h.loc()).toEqual(rn2.loc());
  });

  it("human pass the station", () => {
    const e23 = rn2._extend(6, 8);
    const rn3 = e23.to;
    const p3 = rn3._buildStation();
    const g3 = p3.station.gate;
    l._insertEdge(e23);
    const dept2 = l.top.next.next as DeptTask;
    l.top._setNext(p3, c, distance(p1, p3) / 10);
    p3._setNext(g3, c, distance(c, p3));
    g3._setNext(c, c, distance(c, g3));

    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_GATE);
    g1._step();
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_PLATFORM);
    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_TRAIN);
    h._step();
    h._step();
    const t = new Train(l.top);
    for (let j = 0; j < FPS * STAY_SEC; j++) {
      t._step();
      expect(h.state()).toEqual(HumanState.ON_TRAIN);
      expect(h.loc()).toEqual(rn1.loc());
    }
    for (let j = 0; j < FPS; j++) {
      t._step();
      expect(h.state()).toEqual(HumanState.ON_TRAIN);
    }
    for (let j = 0; j < FPS * STAY_SEC; j++) {
      t._step();
      expect(h.state()).toEqual(HumanState.ON_TRAIN);
      expect(h.loc()).toEqual(rn2.loc());
    }
    for (let j = 0; j < FPS; j++) {
      t._step();
      expect(h.state()).toEqual(HumanState.ON_TRAIN);
    }
    t._step();
    expect(h.state()).toEqual(HumanState.WAIT_EXIT_PLATFORM);
    expect(h.loc()).toEqual(rn3.loc());
  });

  it("suspend departure because crowded", () => {
    const hs: Human[] = [];
    for (let j = 0; j < Train.STAY_SEC * Train.MOBILITY + 2; j++) {
      hs.push(new Human(r, c));
    }
    hs.forEach((_h) => {
      _h._step();
      expect(_h.state()).toEqual(HumanState.WAIT_ENTER_GATE);
    });
    for (let j = 0; j < Gate.MOBILITY_SEC * FPS; j++) g1._step();
    hs.forEach((_h) =>
      expect(_h.state()).toEqual(HumanState.WAIT_ENTER_PLATFORM)
    );
    hs.forEach((_h) => {
      _h._step();
      _h._step();
      expect(_h.state()).toEqual(HumanState.WAIT_TRAIN);
    });
    const t = new Train(l.top);
    for (let j = 0; j < FPS * STAY_SEC + 1; j++) {
      t._step();
      expect(t.loc()).toEqual(rn1.loc());
    }
    hs.forEach((_h) => expect(_h.state()).toEqual(HumanState.ON_TRAIN));
  });
});
