import Company from "models/company";
import DeptTask from "models/dept_task";
import Gate from "models/gate";
import Human, { HumanState } from "models/human";
import modelListener from "models/listener";
import Platform from "models/platform";
import { distance } from "models/pointable";
import RailLine from "models/rail_line";
import RailNode from "models/rail_node";
import Residence from "models/residence";
import Station from "models/station";
import Train from "models/train";
import random from "utils/random";
import ticker from "utils/ticker";

const FPS = 15;
const oldRAND = Human.RAND;
const oldSPEED = Human.SPEED;

beforeAll(() => {
  random.init(new g.XorshiftRandomGenerator(0));
  ticker.init(FPS);
  Human.RAND = 0;
  Human.SPEED = 1;
});

afterAll(() => {
  modelListener.flush();
  ticker.reset();
  Human.RAND = oldRAND;
  Human.SPEED = oldSPEED;
});

describe("platform", () => {
  let c: Company;
  let r: Residence;
  let rn: RailNode;
  let st: Station;
  let g: Gate;
  let l: RailLine;

  beforeEach(() => {
    c = new Company(1, 3, 4);
    r = new Residence([c], 0, 0, (min, max) => random.random().get(min, max));
    rn = new RailNode(0, 0);
    st = new Station();
    g = st.gate;
    l = new RailLine();
  });

  it("register reference on creation", () => {
    const p = new Platform(rn, st);

    expect(p.on).toEqual(rn);
    expect(rn.platform).toEqual(p);
    expect(p.station).toEqual(st);
    expect(st.platforms).toContain(p);
  });

  it("move human on concourse to platform", () => {
    const p = new Platform(rn, st);
    r._setNext(g, c, distance(c, r));
    g._setNext(p, c, distance(c, g));

    expect(g.station.gate).toEqual(g);
    expect(g).toEqual(p.station.gate);

    const h = new Human(r, c, (min, max) => random.random().get(min, max));
    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_GATE);
    g._step();
    expect(g._concourse[0]).toEqual(h);
    expect(p.inQueue.length).toEqual(0);
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_PLATFORM);
    h._step();
    expect(g._concourse.length).toEqual(0);
    expect(p.inQueue[0]).toEqual(h);
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_DEPTQUEUE);
    expect(h._getGate()).toBeUndefined();
    expect(h._getPlatform()).toEqual(p);
  });

  it("move human on platform to gate", () => {
    const p = new Platform(rn, st);
    l._start(p);
    const dept = l.top;
    const t = new Train(dept);

    r._setNext(g, c, distance(c, r));
    g._setNext(p, c, distance(c, g));
    p._setNext(dept, c, distance(c, p));
    dept._setNext(p, c, distance(c, p));

    const h = new Human(r, c, (min, max) => random.random().get(min, max));
    h._step();
    g._step();
    h._step();
    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_TRAIN_ARRIVAL);

    for (let i = 0; i < FPS * Train.STAY_SEC; i++) {
      t._step();
      expect(t.current()._base()).toEqual(dept);
      expect(h.state()).toEqual(HumanState.ON_TRAIN);
      expect(h._getNext()).toEqual(p);
    }

    // 改札へ降りる
    p._setNext(g, c, distance(c, p));
    g._setNext(c, c, distance(c, g));

    t._step();
    expect(t.current()._base()).toEqual(dept);
    expect(h.state()).toEqual(HumanState.WAIT_EXIT_PLATFORM);
    expect(p.outQueue[0]).toEqual(h);
    expect(g.outQueue.length).toEqual(0);
    expect(h._getNext()).toEqual(p);

    h._step();
    expect(h._getNext()).toEqual(g);
    expect(p.outQueue.length).toEqual(0);
    expect(g.outQueue[0]).toEqual(h);
    expect(h._getNext()).toEqual(g);

    expect(h.state()).toEqual(HumanState.WAIT_EXIT_GATE);
  });

  it("changing goal human moves platform to other platform", () => {
    const p = new Platform(rn, st);
    r._setNext(g, c, distance(c, r));
    g._setNext(p, c, distance(c, g));

    const h = new Human(r, c, (min, max) => random.random().get(min, max));
    h._step();
    g._step();
    h._step();

    expect(h.state()).toEqual(HumanState.WAIT_ENTER_DEPTQUEUE);
    expect(p.inQueue[0]).toEqual(h);
    expect(p.outQueue.length).toEqual(0);

    h._setNext(p, c, distance(c, p));
    h._reroute();

    expect(h._getNext()).toEqual(p);

    h._step();

    expect(h.state()).toEqual(HumanState.WAIT_EXIT_PLATFORM);
    expect(p.inQueue.length).toEqual(0);
    expect(p.outQueue[0]).toEqual(h);
  });

  it("died human is removed on concourse", () => {
    const p = new Platform(rn, st);
    r._setNext(g, c, distance(c, r));
    g._setNext(p, c, distance(c, g));
    const h = new Human(r, c, (min, max) => random.random().get(min, max));
    h._step();
    g._step();
    expect(g._concourse[0]).toEqual(h);
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_PLATFORM);

    // platform is crowded
    expect(p.inQueue.length).toEqual(0);
    for (let i = 0; i < Platform.CAPACITY; i++)
      p.inQueue.push(
        new Human(r, c, (min, max) => random.random().get(min, max))
      );
    expect(p.inQueue.length).toEqual(Platform.CAPACITY);

    h._step();
    expect(g._concourse[0]).toEqual(h);
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_PLATFORM);

    for (let i = 0; i < Human.LIFE_SPAN * (1 / Human.STAY_BUFF) * FPS; i++)
      h._step();
    expect(h.state()).toEqual(HumanState.DIED);

    expect(g._concourse.length).toEqual(0);
    expect(p.inQueue.indexOf(h)).toEqual(-1);
  });
});
