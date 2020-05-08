import Company from "models/company";
import Gate from "models/gate";
import Human, { HumanState } from "models/human";
import modelListener from "models/listener";
import Platform from "models/platform";
import { distance } from "models/pointable";
import RailLine from "models/rail_line";
import RailNode from "models/rail_node";
import Residence from "models/residence";
import Station from "models/station";
import ticker from "utils/ticker";

const FPS = 15;
const oldSPEED = Human.SPEED;

beforeAll(() => {
  ticker.init(FPS);
  Human.SPEED = 1;
});

afterAll(() => {
  modelListener.flush();
  ticker.reset();
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
    r = new Residence([c], 0, 0);
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

    const h = new Human(r, c);
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
  });

  it("move human on platform to gate", () => {
    const p = new Platform(rn, st);
    r._setNext(g, c, distance(c, r));
    g._setNext(p, c, distance(c, g));
    p._setNext(p, c, distance(c, p));

    const h = new Human(r, c);
    h._step();
    g._step();
    h._step();

    // 電車からおりる状況を再現
    p._setNext(g, c, distance(c, p));
    g._setNext(c, c, distance(c, g));
    p.outQueue.push(h);

    expect(p.outQueue[0]).toEqual(h);
    expect(g.outQueue.length).toEqual(0);

    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_EXIT_GATE);
    expect(p.outQueue.length).toEqual(0);
    expect(g.outQueue[0]).toEqual(h);
  });

  it("died human is removed on concourse", () => {
    const p = new Platform(rn, st);
    r._setNext(g, c, distance(c, r));
    g._setNext(p, c, distance(c, g));
    const h = new Human(r, c);
    h._step();
    g._step();
    expect(g._concourse[0]).toEqual(h);
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_PLATFORM);

    // platform is crowded
    expect(p.inQueue.length).toEqual(0);
    for (let i = 0; i < Platform.CAPACITY; i++) p.inQueue.push(new Human(r, c));
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
