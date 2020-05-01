import Company from "models/company";
import Gate from "models/gate";
import Human, { HumanState } from "models/human";
import modelListener from "models/listener";
import Platform from "models/platform";
import { distance } from "models/pointable";
import RailNode from "models/rail_node";
import Residence from "models/residence";
import Station from "models/station";
import ticker from "utils/ticker";

const FPS = 15;
const oldSPEED = Human.SPEED;
const oldMOBILITY = Gate.MOBILITY_SEC;
const oldCAPACITY = Gate.CAPACITY;

beforeAll(() => {
  ticker.init(FPS);
  Human.SPEED = 1;
  Gate.CAPACITY = 5;
  Gate.MOBILITY_SEC = 1;
});

afterAll(() => {
  modelListener.flush();
  Human.SPEED = oldSPEED;
  Gate.CAPACITY = oldCAPACITY;
  Gate.MOBILITY_SEC = oldMOBILITY;
  ticker.reset();
});

describe("gate", () => {
  let c: Company;
  let r: Residence;

  beforeEach(() => {
    c = new Company(1, 3, 4);
    r = new Residence([c], 0, 0);
  });

  it("initial create", () => {
    const st = new Station();
    const g = st.gate;
    expect(g.station).toEqual(st);
  });

  it("queue arrived human", () => {
    const rn = new RailNode(3, 4);
    const st = new Station();
    const g = st.gate;
    const p = new Platform(rn, st);
    r._setNext(g, c, distance(c, r));
    const h = new Human(r, c);
    // 改札まで移動
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < FPS; j++) {
        h._step();
        if (i === 4 && j === FPS - 1) {
          expect(h.state()).toEqual(HumanState.WAIT_ENTER_GATE);
          expect(g.inQueue[0]).toEqual(h);
        } else {
          expect(h.state()).toEqual(HumanState.MOVE);
          expect(g.inQueue.length).toEqual(0);
        }
      }
      expect(distance(g, h)).toBeCloseTo(5 - i - 1);
    }
  });

  it("move inqueued human to concourse", () => {
    const rn = new RailNode(0, 0);
    const st = new Station();
    const g = st.gate;
    const p = new Platform(rn, st);
    r._setNext(g, c, distance(c, r));
    const h = new Human(r, c);

    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_GATE);
    expect(g.inQueue[0]).toEqual(h);

    g._step();
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_PLATFORM);
    expect(g.inQueue.length).toEqual(0);
  });

  it("move human on concourse to platform", () => {
    const rn = new RailNode(0, 0);
    const st = new Station();
    const g = st.gate;
    const p = new Platform(rn, st);

    r._setNext(g, c, distance(c, r));
    g._setNext(p, c, distance(c, g));

    const h = new Human(r, c);
    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_GATE);
    g._step();
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_PLATFORM);
    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_DEPTQUEUE);
  });

  it("exit human on platform", () => {
    const rn = new RailNode(0, 0);
    const st = new Station();
    const g = st.gate;
    const p = new Platform(rn, st);

    r._setNext(g, c, distance(c, r));
    g._setNext(p, c, distance(c, g));
    p._setNext(p, c, distance(c, p));

    const h = new Human(r, c);
    h._step();
    g._step();
    h._step();

    for (let j = 0; j < FPS / Gate.MOBILITY_SEC; j++) g._step();

    // 電車からおりる状況を再現
    p._setNext(g, c, distance(c, p));
    g._setNext(c, c, distance(c, g));
    p.outQueue.push(h);

    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_EXIT_GATE);
    expect(g.outQueue[0]).toEqual(h);

    g._step();
    expect(g.outQueue.length).toEqual(0);
    expect(h.state()).toEqual(HumanState.MOVE);
  });

  it("crowed gate refuses human enter it", () => {
    const rn = new RailNode(0, 0);
    const st = new Station();
    const g = st.gate;
    const p = new Platform(rn, st);
    r._setNext(g, c, distance(c, r));
    const h1 = new Human(r, c);
    const h2 = new Human(r, c);
    h1._step();
    h2._step();

    g._step();
    g._step();
    expect(h1.state()).toEqual(HumanState.WAIT_ENTER_PLATFORM);
    expect(h2.state()).toEqual(HumanState.WAIT_ENTER_GATE);
  });

  it("crowed concourse refuses human enter it", () => {
    const rn = new RailNode(0, 0);
    const st = new Station();
    const g = st.gate;
    const p = new Platform(rn, st);
    r._setNext(g, c, distance(c, r));

    for (let i = 0; i < Gate.CAPACITY; i++) {
      const _h = new Human(r, c);
      _h._step();
      g._step();
      for (let j = 0; j < FPS / Gate.MOBILITY_SEC; j++) g._step();
      expect(_h.state()).toEqual(HumanState.WAIT_ENTER_PLATFORM);
    }
    const h = new Human(r, c);
    h._step();
    g._step();
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_GATE);
  });

  it("waiting InQueue do nothing on fire", () => {
    const rn = new RailNode(0, 0);
    const st = new Station();
    const g = st.gate;
    const p = new Platform(rn, st);
    r._setNext(g, c, distance(c, r));

    const h1 = new Human(r, c);
    h1._step();
    g._step();
    expect(h1.state()).toEqual(HumanState.WAIT_ENTER_PLATFORM);
    const h2 = new Human(r, c);
    h2._step();
    g._step();
    expect(h2.state()).toEqual(HumanState.WAIT_ENTER_GATE);
    h2._step();
    expect(h2.state()).toEqual(HumanState.WAIT_ENTER_GATE);
  });

  it("waiting outQueue do nothing on fire", () => {
    const rn = new RailNode(0, 0);
    const st = new Station();
    const g = st.gate;
    const p = new Platform(rn, st);

    r._setNext(g, c, distance(c, r));
    g._setNext(p, c, distance(c, g));
    p._setNext(p, c, distance(c, p));

    const h = new Human(r, c);
    h._step();
    g._step();
    h._step();

    for (let j = 0; j < FPS / Gate.MOBILITY_SEC; j++) g._step();

    // 電車からおりる状況を再現
    p._setNext(g, c, distance(c, p));
    g._setNext(c, c, distance(c, g));
    p.outQueue.push(h);
    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_EXIT_GATE);
    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_EXIT_GATE);
  });

  it("do nothing for human on other platform", () => {
    const rn1 = new RailNode(0, 0);
    const st1 = new Station();
    const g1 = st1.gate;
    const p1 = new Platform(rn1, st1);

    const rn2 = new RailNode(0, 0);
    const st2 = new Station();
    const g2 = st2.gate;
    const p2 = new Platform(rn2, st2);

    r._setNext(g1, c, distance(c, r));
    g1._setNext(p1, c, distance(c, g1));
    p1._setNext(p2, c, distance(c, p1));
    p2._setNext(g2, c, distance(c, p2));
    g2._setNext(c, c, distance(c, g2));

    const h = new Human(r, c);

    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_GATE);
    g1._step();
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_PLATFORM);
    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_DEPTQUEUE);
    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_DEPTQUEUE);
  });
});
