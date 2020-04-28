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

  beforeEach(() => {
    c = new Company(1, 3, 4);
    r = new Residence([c], 0, 0);
    rn = new RailNode(0, 0);
    st = new Station();
    g = st.gate;
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
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_PLATFORM);
    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_TRAIN);
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

    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_EXIT_GATE);
  });
});
