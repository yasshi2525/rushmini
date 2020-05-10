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
import ticker from "utils/ticker";

const FPS = 15;

beforeAll(() => {
  ticker.init(FPS);
});

afterAll(() => {
  modelListener.flush();
});

describe("dept_task", () => {
  let c: Company;
  let r: Residence;
  let g: Gate;
  let p: Platform;
  let dept: DeptTask;

  beforeEach(() => {
    c = new Company(1, 3, 4);
    r = new Residence([c], 0, 0);
    const rn = new RailNode(0, 0);
    p = rn._buildStation();
    g = p.station.gate;
    const l = new RailLine();
    l._start(p);
    dept = l.top;
    r._setNext(g, c, distance(c, r));
    g._setNext(p, c, distance(c, g));
    p._setNext(dept, c, distance(c, p));
  });

  it("queue on platform human", () => {
    const h = new Human(r, c);
    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_GATE);

    g._step();
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_PLATFORM);

    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_DEPTQUEUE);
    expect(p.inQueue[0]).toEqual(h);
    expect(dept._queue().length).toEqual(0);
    expect(h._getNext()).toEqual(dept);
    expect(h._getPlatform()).toEqual(p);
    expect(h._getDeptTask()).toBeUndefined();

    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_TRAIN_ARRIVAL);
    expect(p.inQueue.length).toEqual(0);
    expect(dept._queue()[0]).toEqual(h);
    expect(h._getNext()).toEqual(dept);
    expect(h._getPlatform()).toEqual(undefined);
    expect(h._getDeptTask()).toEqual(dept);
  });

  it("changing goal human on dept queue moves outQueue of platform", () => {
    const h = new Human(r, c);
    h._step();
    g._step();
    h._step();
    h._step();

    h._setNext(p, c, distance(c, h));
    h._reroute();

    expect(h._getNext()).toEqual(p);

    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_EXIT_PLATFORM);
    expect(h._getDeptTask()).toBeUndefined();
    expect(h._getPlatform()).toEqual(p);
    expect(p.outQueue[0]).toEqual(h);
    expect(dept._queue().length).toEqual(0);
  });

  it("died human is removed on platform", () => {
    // gate が通行を許可し、Platformに入れたtickに死んだ場合が該当
    const h = new Human(r, c);
    h._step();
    for (let i = 0; i < Human.LIFE_SPAN * (1 / Human.STAY_BUFF) * FPS - 1; i++)
      h._step();

    g._step();
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_PLATFORM);
    expect(p.inQueue.length).toEqual(0);
    expect(dept._queue().length).toEqual(0);

    h._step();
    // 本来であれば WAIT_ENTER_DEPTQUEUE になっている
    expect(h.state()).toEqual(HumanState.DIED);
    expect(p.inQueue.length).toEqual(0);
    expect(dept._queue().length).toEqual(0);
  });

  it("died human is removed from queue", () => {
    const h = new Human(r, c);
    h._step();
    g._step();
    h._step();
    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_TRAIN_ARRIVAL);
    expect(dept._queue()[0]).toEqual(h);
    for (let i = 0; i < Human.LIFE_SPAN * (1 / Human.STAY_BUFF) * FPS; i++)
      h._step();

    expect(h.state()).toEqual(HumanState.DIED);
    expect(dept._queue().length).toEqual(0);
  });
});
