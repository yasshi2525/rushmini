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

    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_TRAIN_ARRIVAL);
    expect(p.inQueue.length).toEqual(0);
    expect(dept._queue()[0]).toEqual(h);
  });
});
