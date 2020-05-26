import DeptTask from "models/dept_task";
import EdgeTask from "models/edge_task";
import Gate from "models/gate";
import LineTask from "models/line_task";
import modelListener, { EventType } from "models/listener";
import Platform from "models/platform";
import RailEdge from "models/rail_edge";
import RailLine from "models/rail_line";
import RailNode from "models/rail_node";
import Station from "models/station";
import Train from "models/train";
import userResource, { ModelState, UserResource } from "models/user_resource";
import { remove } from "utils/common";

let oldWarn: (msg: string) => void;

beforeAll(() => {
  oldWarn = console.warn;
});

afterAll(() => {
  modelListener.flush();
});

describe("user_resource", () => {
  describe("initialize", () => {
    it("have empty primary line", () => {
      const instance = new UserResource();
      instance.init();
      expect(instance.getPrimaryLine()).toBeInstanceOf(RailLine);
      expect(instance.getPrimaryLine().top).toBeUndefined();
      expect(instance.getState()).toEqual(ModelState.INITED);
    });
  });

  describe("start", () => {
    let instance: UserResource;

    beforeEach(() => {
      instance = new UserResource();
      instance.init();
    });
    afterEach(() => {
      console.warn = oldWarn;
    });

    it("start when initial state", () => {
      const X = 1;
      const Y = 2;
      instance.start(X, Y);
      const dept = instance.getPrimaryLine().top;
      expect(dept).toBeInstanceOf(DeptTask);
      expect(dept.departure().loc()).toEqual({ x: X, y: Y });
      expect(dept.destination().loc()).toEqual({ x: X, y: Y });
      expect(instance.getState()).toEqual(ModelState.STARTED);
    });

    it("forbit start when started state", () => {
      console.warn = jest.fn();
      const X = 1;
      const Y = 2;

      instance.start(X, Y);
      instance.start(3, 4);

      const dept = instance.getPrimaryLine().top;
      expect(dept).toBeInstanceOf(DeptTask);
      expect(dept.departure().loc()).toEqual({ x: X, y: Y });
      expect(dept.destination().loc()).toEqual({ x: X, y: Y });
      expect(dept.next).toEqual(dept);
      expect(instance.getState()).toEqual(ModelState.STARTED);
      expect(console.warn).toHaveBeenCalled();
    });

    it("forbit start when fixed state", () => {
      console.warn = jest.fn();
      const X = 1;
      const Y = 2;

      instance.start(X, Y);
      instance.end();
      instance.start(3, 4);

      const dept = instance.getPrimaryLine().top;
      expect(dept).toBeInstanceOf(DeptTask);
      expect(dept.departure().loc()).toEqual({ x: X, y: Y });
      expect(dept.destination().loc()).toEqual({ x: X, y: Y });
      expect(dept.next).toEqual(dept);
      expect(instance.getState()).toEqual(ModelState.FIXED);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe("extend", () => {
    let instance: UserResource;
    let ts: Train[];
    let sts: Station[];

    beforeEach(() => {
      instance = new UserResource();
      instance.init();
      ts = [];
      sts = [];
      modelListener.find(EventType.CREATED, Train).register((t) => ts.push(t));
      modelListener
        .find(EventType.CREATED, Station)
        .register((st) => sts.push(st));
    });

    afterEach(() => {
      console.warn = oldWarn;
      modelListener.unregisterAll();
      modelListener.flush();
    });

    it("extend", () => {
      const X1 = 1;
      const Y1 = 2;
      const X2 = 23;
      const Y2 = 24;

      instance.start(X1, Y1);
      instance.extend(X2, Y2);

      const dept = instance.getPrimaryLine().top;
      expect(dept.departure().loc()).toEqual({ x: X1, y: Y1 });
      expect(dept.destination().loc()).toEqual({ x: X1, y: Y1 });

      const outbound = dept.next;
      expect(outbound.departure().loc()).toEqual({ x: X1, y: Y1 });
      expect(outbound.destination().loc()).toEqual({ x: X2, y: Y2 });

      const inbound = outbound.next;
      expect(inbound.departure().loc()).toEqual({ x: X2, y: Y2 });
      expect(inbound.destination().loc()).toEqual({ x: X1, y: Y1 });

      expect(inbound.next).toEqual(dept);
      expect(instance.getState()).toEqual(ModelState.STARTED);
    });

    it("extend skip", () => {
      const X1 = 1;
      const Y1 = 2;
      const X2 = 3;
      const Y2 = 4;

      instance.start(X1, Y1);
      instance.extend(X2, Y2);

      const dept1 = instance.getPrimaryLine().top;
      expect(dept1.departure().loc()).toEqual({ x: X1, y: Y1 });
      expect(dept1.destination().loc()).toEqual({ x: X1, y: Y1 });
      expect(dept1.next).toEqual(dept1);
    });

    it("build station at regular interval", () => {
      instance.start(0, 0);
      let tail: LineTask = instance.getPrimaryLine().top;
      for (
        let i = 0;
        i < UserResource.STATION_INTERVAL / UserResource.DIST - 1;
        i++
      ) {
        instance.extend((i + 1) * UserResource.DIST, 0);
        tail = tail.next;
        expect(tail.destination().platform).toBeUndefined();
      }

      instance.extend(UserResource.STATION_INTERVAL + UserResource.DIST * 2, 0);
      tail = tail.next;
      expect(tail.destination().platform).not.toBeUndefined();
      tail = tail.next;
      expect(tail).toBeInstanceOf(DeptTask);

      instance.extend(UserResource.STATION_INTERVAL, 0);
      tail = tail.next;
      expect(tail.destination().platform).toBeUndefined();
      expect(instance.getState()).toEqual(ModelState.STARTED);
    });

    it("deploy train at regular interval", () => {
      instance.start(0, 0);
      expect(ts.length).toEqual(1);
      let tail: LineTask = instance.getPrimaryLine().top;
      expect(ts[0].loc()).toEqual(tail.departure().loc());

      // 駅を2個たてるまでは電車を置かない
      for (
        let i = 0;
        i < (UserResource.STATION_INTERVAL * 2) / UserResource.DIST - 1;
        i++
      ) {
        instance.extend((i + 1) * UserResource.DIST, 0);
        tail = tail.next;
        if (tail.destination().platform) {
          tail = tail.next;
        }
        expect(ts.length).toEqual(1);
      }

      instance.extend(
        (UserResource.STATION_INTERVAL * 2 + 1) * UserResource.DIST,
        0
      );
      tail = tail.next;
      tail = tail.next;
      expect(ts.length).toEqual(3);
      expect(ts[1].loc()).toEqual(tail.departure().loc());
      expect(ts[2].loc()).toEqual(tail.departure().loc());
      expect(instance.getState()).toEqual(ModelState.STARTED);
    });

    it("deploy 2 train in intervaled station", () => {
      instance.start(0, 0);
      for (let i = 0; i < 1000; i++) {
        instance.extend(i, i);
        const expected = 1 + Math.floor((sts.length - 1) / 2) * 2;
        expect(ts.length).toBeCloseTo(expected);
      }
    });

    it("forbit to extend when initial state", () => {
      console.warn = jest.fn();
      instance.extend(3, 4);
      expect(instance.getPrimaryLine().top).toBeUndefined();
      expect(instance.getState()).toEqual(ModelState.INITED);
      expect(console.warn).toHaveBeenCalled();
    });

    it("forbit to extend when fixed state", () => {
      console.warn = jest.fn();
      instance.start(1, 2);
      instance.end();
      instance.extend(3, 4);
      const dept = instance.getPrimaryLine().top;
      expect(dept.next).toEqual(dept);
      expect(instance.getState()).toEqual(ModelState.FIXED);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe("end", () => {
    let instance: UserResource;
    let ts: Train[];
    let sts: Station[];
    beforeEach(() => {
      instance = new UserResource();
      instance.init();
      ts = [];
      sts = [];
      modelListener.find(EventType.CREATED, Train).register((t) => ts.push(t));
      modelListener
        .find(EventType.DELETED, Train)
        .register((t) => remove(ts, t));
      modelListener
        .find(EventType.CREATED, Station)
        .register((st) => sts.push(st));
    });

    afterEach(() => {
      console.warn = oldWarn;
      modelListener.flush();
      modelListener.unregisterAll();
    });

    it("skipping extend ends does nothing", () => {
      instance.start(0, 0);
      instance.end();
      expect(sts.length).toEqual(1);
      expect(ts.length).toEqual(1);
      expect(instance.getState()).toEqual(ModelState.FIXED);
    });

    it("end discards lastPos", () => {
      instance.start(0, 0);
      instance.extend(1, 1); // lastPos = (1, 1)
      instance.end();
      expect(sts.length).toEqual(1);
      expect(ts.length).toEqual(1);
      expect(instance.getState()).toEqual(ModelState.FIXED);
    });

    it("end not discards long distance lastPos", () => {
      instance.start(0, 0);
      instance.extend(50, 50); // lastPos = (50, 50)
      instance.end();
      expect(sts.length).toEqual(2);
      expect(ts.length).toEqual(2);
      expect(instance.getState()).toEqual(ModelState.FIXED);
    });

    it("end builds station in lastPos", () => {
      instance.start(0, 0);
      instance.extend(11, 0);
      instance.extend(12, 0); // lastPos = (12, 0)
      instance.end();
      expect(sts.length).toEqual(2);
      expect(ts.length).toEqual(2);
      expect(instance.getState()).toEqual(ModelState.FIXED);
    });

    it("end remove double train", () => {
      instance.start(0, 0);
      instance.extend(UserResource.STATION_INTERVAL, 0);
      instance.extend(UserResource.STATION_INTERVAL * 2, 0);
      instance.end();
      expect(sts.length).toEqual(3);
      expect(ts.length).toEqual(2);
      expect(instance.getState()).toEqual(ModelState.FIXED);
    });

    it("forbit to end when state is 'INITED'", () => {
      console.warn = jest.fn();
      instance.end();
      expect(instance.getPrimaryLine().top).toBeUndefined();
      expect(instance.getState()).toEqual(ModelState.INITED);
      expect(console.warn).toHaveBeenCalled();
    });

    it("forbit to end when state is 'FIXED'", () => {
      console.warn = jest.fn();
      instance.start(0, 0);
      instance.end();
      instance.end();
      expect(instance.getPrimaryLine().top).toBeInstanceOf(DeptTask);
      expect(instance.getPrimaryLine().top.next).toBeInstanceOf(DeptTask);
      expect(instance.getState()).toEqual(ModelState.FIXED);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe("listener", () => {
    let instance: UserResource;
    let startCounter: number;
    let endCounter: number;
    let resetCounter: number;
    let listener: {
      onStarted: (ev: UserResource) => void;
      onFixed: (ev: UserResource) => void;
      onReset: (ev: UserResource) => void;
    };

    beforeEach(() => {
      instance = new UserResource();
      instance.init();
      startCounter = 1;
      endCounter = 1;
      resetCounter = 1;
      listener = {
        onStarted: () => startCounter++,
        onFixed: () => endCounter++,
        onReset: () => resetCounter++,
      };
    });

    it("register", () => {
      expect(startCounter).toEqual(1);
      expect(endCounter).toEqual(1);

      instance.stateListeners.push(listener);

      expect(startCounter).toEqual(1);
      expect(endCounter).toEqual(1);
    });

    it("handle start", () => {
      expect(startCounter).toEqual(1);
      expect(endCounter).toEqual(1);

      instance.stateListeners.push(listener);

      instance.start(0, 0);

      expect(startCounter).toEqual(2);
      expect(endCounter).toEqual(1);
    });

    it("handle end", () => {
      expect(startCounter).toEqual(1);
      expect(endCounter).toEqual(1);

      instance.stateListeners.push(listener);

      instance.start(0, 0);
      instance.end();

      expect(startCounter).toEqual(2);
      expect(endCounter).toEqual(2);
    });

    it("reset", () => {
      expect(startCounter).toEqual(1);
      expect(endCounter).toEqual(1);
      expect(resetCounter).toEqual(1);

      instance.stateListeners.push(listener);
      instance.reset();

      expect(startCounter).toEqual(1);
      expect(endCounter).toEqual(1);
      expect(resetCounter).toEqual(1); // reset でカウンタも外されるため
    });
  });

  describe("branch", () => {
    let instance: UserResource;

    beforeEach(() => {
      instance = new UserResource();
      instance.init();
    });

    afterEach(() => {
      console.warn = oldWarn;
    });

    it("branch is started after fix state", () => {
      instance.start(0, 0);
      instance.extend(3, 4);
      instance.end();

      const p1 = instance.getPrimaryLine().top.departure().platform;

      instance.branch(p1);
      expect(instance.getState()).toEqual(ModelState.STARTED);
    });

    it("branch can be fixed after end", () => {
      instance.start(0, 0);
      instance.extend(3, 4);
      instance.end();

      const p1 = instance.getPrimaryLine().top.departure().platform;

      instance.branch(p1);
      instance.extend(3, 0);
      instance.end();
      expect(instance.getState()).toEqual(ModelState.FIXED);
    });

    it("forbit to branch before fixed", () => {
      console.warn = jest.fn();
      const rn = new RailNode(0, 0);
      const p = rn._buildStation();

      instance.branch(p);
      expect(instance.getState()).toEqual(ModelState.INITED);

      instance.start(0, 0);
      instance.branch(p);
      expect(instance.getState()).toEqual(ModelState.STARTED);
      expect(console.warn).toHaveBeenCalled();
    });

    it("forbit to branch from unrelated station", () => {
      console.warn = jest.fn();
      const rnX = new RailNode(0, 0);
      const pX = rnX._buildStation();

      instance.start(0, 0);
      instance.end();

      instance.branch(pX);
      expect(instance.getState()).toEqual(ModelState.FIXED);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe("station", () => {
    let ps: Platform[];
    let instance: UserResource;

    beforeEach(() => {
      ps = [];
      instance = new UserResource();
      instance.init();
      modelListener
        .find(EventType.CREATED, Platform)
        .register((p) => ps.push(p));
    });

    afterEach(() => {
      console.warn = oldWarn;
      modelListener.unregisterAll();
      modelListener.flush();
    });

    it("forbit to create station on unfix staed", () => {
      console.warn = jest.fn();
      instance.start(0, 0);
      instance.station(instance.getPrimaryLine().top.departure());
      expect(instance.getState()).toEqual(ModelState.STARTED);
      expect(ps.length).toEqual(1);
      expect(console.warn).toHaveBeenCalled();
    });

    it("forbit to create station on unrelated rail node", () => {
      console.warn = jest.fn();
      instance.start(0, 0);
      instance.end();
      expect(ps.length).toEqual(1);
      instance.station(new RailNode(0, 0));
      expect(ps.length).toEqual(1);
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe("rollback", () => {
    let rns: RailNode[];
    let res: RailEdge[];
    let sts: Station[];
    let ps: Platform[];
    let gs: Gate[];
    let ds: DeptTask[];
    let es: EdgeTask[];
    let ts: Train[];

    beforeEach(() => {
      userResource.init();
      rns = [];
      res = [];
      sts = [];
      ps = [];
      gs = [];
      ds = [];
      es = [];
      ts = [];
      modelListener
        .find(EventType.CREATED, RailNode)
        .register((rn) => rns.push(rn));
      modelListener
        .find(EventType.CREATED, RailEdge)
        .register((re) => res.push(re));
      modelListener
        .find(EventType.CREATED, Station)
        .register((st) => sts.push(st));
      modelListener
        .find(EventType.CREATED, Platform)
        .register((p) => ps.push(p));
      modelListener.find(EventType.CREATED, Gate).register((g) => gs.push(g));
      modelListener
        .find(EventType.CREATED, DeptTask)
        .register((d) => ds.push(d));
      modelListener
        .find(EventType.CREATED, EdgeTask)
        .register((e) => es.push(e));
      modelListener.find(EventType.CREATED, Train).register((t) => ts.push(t));

      modelListener
        .find(EventType.DELETED, RailNode)
        .register((rn) => remove(rns, rn));
      modelListener
        .find(EventType.DELETED, RailEdge)
        .register((re) => remove(res, re));
      modelListener
        .find(EventType.DELETED, Station)
        .register((st) => remove(sts, st));
      modelListener
        .find(EventType.DELETED, Platform)
        .register((p) => remove(ps, p));
      modelListener
        .find(EventType.DELETED, Gate)
        .register((g) => remove(gs, g));
      modelListener
        .find(EventType.DELETED, DeptTask)
        .register((d) => remove(ds, d));
      modelListener
        .find(EventType.DELETED, EdgeTask)
        .register((e) => remove(es, e));
      modelListener
        .find(EventType.DELETED, Train)
        .register((t) => remove(ts, t));
    });

    afterEach(() => {
      userResource.reset();
      modelListener.flush();
      modelListener.unregisterAll();
    });

    it("rollback delete building", () => {
      userResource.start(0, 0);
      userResource.extend(3, 4);
      userResource.end();

      userResource.rollback();

      expect(rns.length).toEqual(0);
      expect(res.length).toEqual(0);
      expect(sts.length).toEqual(0);
      expect(ps.length).toEqual(0);
      expect(gs.length).toEqual(0);
      expect(ts.length).toEqual(0);
    });

    it("rollback delete branching", () => {
      userResource.start(0, 0);
      userResource.extend(13, 4);
      userResource.end();

      expect(rns.length).toEqual(2);
      expect(res.length).toEqual(2);
      expect(sts.length).toEqual(2);
      expect(ps.length).toEqual(2);
      expect(gs.length).toEqual(2);
      expect(ts.length).toEqual(2);

      userResource.commit();

      userResource.branch(userResource.getPrimaryLine().top.stay);
      userResource.extend(3, 0);
      userResource.end();

      userResource.rollback();

      expect(rns.length).toEqual(2);
      expect(res.length).toEqual(2);
      expect(sts.length).toEqual(2);
      expect(ps.length).toEqual(2);
      expect(gs.length).toEqual(2);
      expect(ts.length).toEqual(2);
    });
  });
});
