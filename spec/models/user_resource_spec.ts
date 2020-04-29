import DeptTask from "models/dept_task";
import LineTask from "models/line_task";
import modelListener from "models/listener";
import RailLine from "models/rail_line";
import {
  ModelState,
  stationInterval,
  UserResource,
} from "models/user_resource";

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
      expect(dept.desttination().loc()).toEqual({ x: X, y: Y });
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
      expect(dept.desttination().loc()).toEqual({ x: X, y: Y });
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
      expect(dept.desttination().loc()).toEqual({ x: X, y: Y });
      expect(dept.next).toEqual(dept);
      expect(instance.getState()).toEqual(ModelState.FIXED);
    });
  });

  describe("extend", () => {
    let instance: UserResource;

    beforeEach(() => {
      instance = new UserResource();
    });

    it("extend", () => {
      const X1 = 1;
      const Y1 = 2;
      const X2 = 3;
      const Y2 = 4;

      instance.start(X1, Y1);
      instance.extend(X2, Y2);

      const dept = instance.getPrimaryLine().top;
      expect(dept.departure().loc()).toEqual({ x: X1, y: Y1 });
      expect(dept.desttination().loc()).toEqual({ x: X1, y: Y1 });

      const outbound = dept.next;
      expect(outbound.departure().loc()).toEqual({ x: X1, y: Y1 });
      expect(outbound.desttination().loc()).toEqual({ x: X2, y: Y2 });

      const inbound = outbound.next;
      expect(inbound.departure().loc()).toEqual({ x: X2, y: Y2 });
      expect(inbound.desttination().loc()).toEqual({ x: X1, y: Y1 });

      expect(inbound.next).toEqual(dept);
      expect(instance.getState()).toEqual(ModelState.STARTED);
    });

    it("build station at regular interval", () => {
      instance.start(0, 0);
      let tail: LineTask = instance.getPrimaryLine().top;
      for (let i = 0; i < stationInterval - 1; i++) {
        instance.extend(i, 0);
        tail = tail.next;
        expect(tail.desttination().platform).toBeUndefined();
      }

      instance.extend(stationInterval - 1, 0);
      tail = tail.next;
      expect(tail.desttination().platform).not.toBeUndefined();
      tail = tail.next;
      expect(tail).toBeInstanceOf(DeptTask);

      instance.extend(stationInterval, 0);
      tail = tail.next;
      expect(tail.desttination().platform).toBeUndefined();
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
});
