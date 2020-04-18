import model, { Model, ModelStateType, stationInterval } from "models";
import RailLine from "models/rail_line";
import { DeptTask } from "models/line_task";

describe("model", () => {
  describe("initialize", () => {
    it("have empty primary line", () => {
      const instance = new Model();
      expect(instance.primaryLine).toBeInstanceOf(RailLine);
      expect(instance.primaryLine.top).toBeUndefined();
      expect(instance.getState()).toEqual(ModelStateType.INITED);
    });
  });

  describe("start", () => {
    var instance: Model;

    beforeEach(() => {
      instance = new Model();
    });

    it("start when initial state", () => {
      const X = 1;
      const Y = 2;
      instance.start(X, Y);
      const dept = instance.primaryLine.top;
      expect(dept).toBeInstanceOf(DeptTask);
      expect(dept._getDept().x).toEqual(X);
      expect(dept._getDept().y).toEqual(Y);
      expect(dept._getDest().x).toEqual(X);
      expect(dept._getDest().y).toEqual(Y);
      expect(instance.getState()).toEqual(ModelStateType.STARTED);
    });

    it("forbit start when started state", () => {
      const X = 1;
      const Y = 2;

      instance.start(X, Y);
      instance.start(3, 4);

      const dept = instance.primaryLine.top;
      expect(dept).toBeInstanceOf(DeptTask);
      expect(dept._getDept().x).toEqual(X);
      expect(dept._getDept().y).toEqual(Y);
      expect(dept._getDest().x).toEqual(X);
      expect(dept._getDest().y).toEqual(Y);
      expect(dept.next).toEqual(dept);
      expect(instance.getState()).toEqual(ModelStateType.STARTED);
    });

    it("forbit start when fixed state", () => {
      const X = 1;
      const Y = 2;

      instance.start(X, Y);
      instance.end();
      instance.start(3, 4);

      const dept = instance.primaryLine.top;
      expect(dept).toBeInstanceOf(DeptTask);
      expect(dept._getDept().x).toEqual(X);
      expect(dept._getDept().y).toEqual(Y);
      expect(dept._getDest().x).toEqual(X);
      expect(dept._getDest().y).toEqual(Y);
      expect(dept.next).toEqual(dept);
      expect(instance.getState()).toEqual(ModelStateType.FIXED);
    });
  });

  describe("extend", () => {
    var instance: Model;

    beforeEach(() => {
      instance = new Model();
    });

    it("extend", () => {
      const X1 = 1;
      const Y1 = 2;
      const X2 = 3;
      const Y2 = 4;

      instance.start(X1, Y1);
      instance.extend(X2, Y2);

      const dept = instance.primaryLine.top;
      expect(dept._getDept().x).toEqual(X1);
      expect(dept._getDept().y).toEqual(Y1);
      expect(dept._getDest().x).toEqual(X1);
      expect(dept._getDest().y).toEqual(Y1);

      const outbound = dept.next;
      expect(outbound._getDept().x).toEqual(X1);
      expect(outbound._getDept().y).toEqual(Y1);
      expect(outbound._getDest().x).toEqual(X2);
      expect(outbound._getDest().y).toEqual(Y2);

      const inbound = outbound.next;
      expect(inbound._getDept().x).toEqual(X2);
      expect(inbound._getDept().y).toEqual(Y2);
      expect(inbound._getDest().x).toEqual(X1);
      expect(inbound._getDest().y).toEqual(Y1);

      expect(inbound.next).toEqual(dept);
      expect(instance.getState()).toEqual(ModelStateType.STARTED);
    });

    it("build station at regular interval", () => {
      console.log("start");
      instance.start(0, 0);
      var tail = instance.primaryLine.top;
      for (var i = 0; i < stationInterval - 1; i++) {
        instance.extend(i, 0);
        tail = tail.next;
        expect(tail._getDest().platform).toBeUndefined();
      }

      instance.extend(stationInterval - 1, 0);
      tail = tail.next;
      expect(tail._getDest().platform).not.toBeUndefined();
      tail = tail.next;
      expect(tail).toBeInstanceOf(DeptTask);

      instance.extend(stationInterval, 0);
      tail = tail.next;
      expect(tail._getDest().platform).toBeUndefined();
      expect(instance.getState()).toEqual(ModelStateType.STARTED);
    });

    it("forbit to extend when initial state", () => {
      instance.extend(3, 4);
      expect(instance.primaryLine.top).toBeUndefined();
      expect(instance.getState()).toEqual(ModelStateType.INITED);
    });

    it("forbit to extend when fixed state", () => {
      instance.start(1, 2);
      instance.end();
      instance.extend(3, 4);
      const dept = instance.primaryLine.top;
      expect(dept.next).toEqual(dept);
      expect(instance.getState()).toEqual(ModelStateType.FIXED);
    });
  });

  describe("end", () => {
    var instance: Model;
    beforeEach(() => {
      instance = new Model();
    });

    it("end with building station", () => {
      instance.start(0, 0);
      instance.extend(1, 1);
      instance.end();
      const dept = instance.primaryLine.top.next.next;
      expect(dept).toBeInstanceOf(DeptTask);
      expect(dept._getDept().x).toEqual(1);
      expect(dept._getDept().y).toEqual(1);
      expect(instance.getState()).toEqual(ModelStateType.FIXED);
    });

    it("forbit to end when state is 'INITED'", () => {
      instance.end();
      expect(instance.primaryLine.top).toBeUndefined();
      expect(instance.getState()).toEqual(ModelStateType.INITED);
    });

    it("forbit to end when state is 'FIXED'", () => {
      instance.start(0, 0);
      instance.end();
      instance.end();
      expect(instance.primaryLine.top).toBeInstanceOf(DeptTask);
      expect(instance.primaryLine.top.next).toBeInstanceOf(DeptTask);
      expect(instance.getState()).toEqual(ModelStateType.FIXED);
    });
  });

  describe("listener", () => {
    var instance: Model;
    var startCounter: number;
    var endCounter: number;
    var listener: {
      onStarted: (ev: Model) => void;
      onFixed: (ev: Model) => void;
    };

    beforeEach(() => {
      instance = new Model();
      startCounter = 1;
      endCounter = 1;
      listener = {
        onStarted: () => startCounter++,
        onFixed: () => endCounter++,
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
  });
});
