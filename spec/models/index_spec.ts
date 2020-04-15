import { Model, ModelStateType } from "models";
import RailLine from "models/rail_line";
import { DeptTask } from "models/line_task";

describe("model", () => {
  describe("initialize", () => {
    it("have empty primary line", () => {
      const instance = new Model();
      expect(instance.primaryLine).toBeInstanceOf(RailLine);
      expect(instance.primaryLine.top).toBeUndefined();
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
      expect(dept._getDept().vector).toEqual({ x: X, y: Y });
      expect(dept._getDest().vector).toEqual({ x: X, y: Y });
    });

    it("forbit start when started state", () => {
      instance.start(1, 2);
      instance.start(3, 4);

      const dept = instance.primaryLine.top;
      expect(dept).toBeInstanceOf(DeptTask);
      expect(dept._getDept().vector).toEqual({ x: 1, y: 2 });
      expect(dept._getDest().vector).toEqual({ x: 1, y: 2 });
      expect(dept.next).toEqual(dept);
    });

    it("forbit start when fixed state", () => {
      instance.start(1, 2);
      instance.end();
      instance.start(3, 4);

      const dept = instance.primaryLine.top;
      expect(dept).toBeInstanceOf(DeptTask);
      expect(dept._getDept().vector).toEqual({ x: 1, y: 2 });
      expect(dept._getDest().vector).toEqual({ x: 1, y: 2 });
      expect(dept.next).toEqual(dept);
    });
  });

  describe("extend", () => {
    var instance: Model;

    beforeEach(() => {
      instance = new Model();
    });

    it("extend", () => {
      instance.start(1, 2);
      instance.extend(3, 4);

      const dept = instance.primaryLine.top;
      expect(dept._getDept().vector).toEqual({ x: 1, y: 2 });
      expect(dept._getDest().vector).toEqual({ x: 1, y: 2 });

      const outbound = dept.next;
      expect(outbound._getDept().vector).toEqual({ x: 1, y: 2 });
      expect(outbound._getDest().vector).toEqual({ x: 3, y: 4 });

      const inbound = outbound.next;
      expect(inbound._getDept().vector).toEqual({ x: 3, y: 4 });
      expect(inbound._getDest().vector).toEqual({ x: 1, y: 2 });

      expect(inbound.next).toEqual(dept);
    });

    it("forbit to extend when initial state", () => {
      instance.extend(3, 4);
      expect(instance.primaryLine.top).toBeUndefined();
    });

    it("forbit to extend when fixed state", () => {
      instance.start(1, 2);
      instance.end();
      instance.extend(3, 4);
      const dept = instance.primaryLine.top;
      expect(dept.next).toEqual(dept);
    });
  });

  describe("end", () => {
    var instance: Model;
    beforeEach(() => {
      instance = new Model();
    });

    it("end when started state", () => {});
  });
});
