import DeptTask from "models/dept_task";
import LineTask from "models/line_task";
import modelListener, { EventType } from "models/listener";
import RailLine from "models/rail_line";
import RailNode from "models/rail_node";
import Train from "models/train";
import { ModelState, UserResource } from "models/user_resource";

afterAll(() => {
  modelListener.flush();
});

describe("user_resource", () => {
  describe("initialize", () => {
    it("have empty primary line", () => {
      const instance = new UserResource();
      expect(instance.getPrimaryLine()).toBeInstanceOf(RailLine);
      expect(instance.getPrimaryLine().top).toBeUndefined();
      expect(instance.getState()).toEqual(ModelState.INITED);
    });
  });

  describe("start", () => {
    let instance: UserResource;

    beforeEach(() => {
      instance = new UserResource();
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
    });

    it("forbit start when fixed state", () => {
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
    });
  });

  describe("extend", () => {
    let instance: UserResource;
    let ts: Train[];

    beforeEach(() => {
      instance = new UserResource();
      ts = [];
      modelListener.find(EventType.CREATED, Train).register((t) => ts.push(t));
    });

    afterEach(() => {
      modelListener.unregisterAll();
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

      instance.end();

      const outbound = instance.getPrimaryLine().top.next;
      expect(outbound.departure().loc()).toEqual({ x: X1, y: Y1 });
      expect(outbound.destination().loc()).toEqual({ x: X2, y: Y2 });

      const dept2 = outbound.next;
      expect(dept2.departure().loc()).toEqual({ x: X2, y: Y2 });
      expect(dept2.destination().loc()).toEqual({ x: X2, y: Y2 });

      const inbound = dept2.next;
      expect(inbound.departure().loc()).toEqual({ x: X2, y: Y2 });
      expect(inbound.destination().loc()).toEqual({ x: X1, y: Y1 });

      expect(inbound.next).toEqual(dept1);
      expect(instance.getState()).toEqual(ModelState.FIXED);
    });

    it("build station at regular interval", () => {
      instance.start(0, 0);
      let tail: LineTask = instance.getPrimaryLine().top;
      for (let i = 0; i < UserResource.STATION_INTERVAL - 1; i++) {
        instance.extend((i + 1) * UserResource.DIST, 0);
        tail = tail.next;
        expect(tail.destination().platform).toBeUndefined();
      }

      instance.extend(UserResource.STATION_INTERVAL - 1, 0);
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

      for (let i = 0; i < UserResource.TRAIN_INTERVAL - 1; i++) {
        instance.extend((i + 1) * UserResource.DIST, 0);
        tail = tail.next;
        if (tail.destination().platform) {
          tail = tail.next;
        }
        expect(ts.length).toEqual(1);
      }

      instance.extend((UserResource.TRAIN_INTERVAL + 1) * UserResource.DIST, 0);
      tail = tail.next;
      tail = tail.next;
      expect(ts.length).toEqual(3);
      expect(ts[1].loc()).toEqual(tail.departure().loc());
      expect(ts[2].loc()).toEqual(tail.departure().loc());

      instance.extend(UserResource.TRAIN_INTERVAL, 0);
      expect(ts.length).toEqual(3);
      expect(instance.getState()).toEqual(ModelState.STARTED);
    });

    it("forbit to extend when initial state", () => {
      instance.extend(3, 4);
      expect(instance.getPrimaryLine().top).toBeUndefined();
      expect(instance.getState()).toEqual(ModelState.INITED);
    });

    it("forbit to extend when fixed state", () => {
      instance.start(1, 2);
      instance.end();
      instance.extend(3, 4);
      const dept = instance.getPrimaryLine().top;
      expect(dept.next).toEqual(dept);
      expect(instance.getState()).toEqual(ModelState.FIXED);
    });
  });

  describe("end", () => {
    let instance: UserResource;
    beforeEach(() => {
      instance = new UserResource();
    });

    it("end with building station", () => {
      instance.start(0, 0);
      instance.extend(1, 1);
      instance.end();
      const dept = instance.getPrimaryLine().top.next.next;
      expect(dept).toBeInstanceOf(DeptTask);
      expect(dept.departure().loc()).toEqual({ x: 1, y: 1 });
      expect(instance.getState()).toEqual(ModelState.FIXED);
    });

    it("forbit to end when state is 'INITED'", () => {
      instance.end();
      expect(instance.getPrimaryLine().top).toBeUndefined();
      expect(instance.getState()).toEqual(ModelState.INITED);
    });

    it("forbit to end when state is 'FIXED'", () => {
      instance.start(0, 0);
      instance.end();
      instance.end();
      expect(instance.getPrimaryLine().top).toBeInstanceOf(DeptTask);
      expect(instance.getPrimaryLine().top.next).toBeInstanceOf(DeptTask);
      expect(instance.getState()).toEqual(ModelState.FIXED);
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
      expect(resetCounter).toEqual(2);
    });
  });

  describe("branch", () => {
    let instance: UserResource;

    beforeEach(() => {
      instance = new UserResource();
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
      const rn = new RailNode(0, 0);
      const p = rn._buildStation();

      instance.branch(p);
      expect(instance.getState()).toEqual(ModelState.INITED);

      instance.start(0, 0);
      instance.branch(p);
      expect(instance.getState()).toEqual(ModelState.STARTED);
    });

    it("forbit to branch from unrelated station", () => {
      const rnX = new RailNode(0, 0);
      const pX = rnX._buildStation();

      instance.start(0, 0);
      instance.end();

      instance.branch(pX);
      expect(instance.getState()).toEqual(ModelState.FIXED);
    });
  });
});
