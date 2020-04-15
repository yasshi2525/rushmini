import RailLine from "models/rail_line";
import LineTask, { DeptTask, EdgeTask } from "models/line_task";
import RailNode from "models/rail_node";
import RailEdge from "models/rail_edge";
import Platform from "models/platform";

describe("line_task", () => {
  it("first departure", () => {
    const l = new RailLine();
    const rn = new RailNode(0, 0);
    const p = rn._buildStation();
    const dept = new DeptTask(l, p);

    expect(dept.stay).toEqual(p);

    expect(dept.parent).toEqual(l);
    expect(dept.prev).toEqual(dept);
    expect(dept.next).toEqual(dept);
    expect(dept._getDept()).toEqual(rn);
    expect(dept._getDest()).toEqual(rn);
    expect(dept._getVector()).toEqual({ x: 0, y: 0 });
    expect(dept._getLength()).toEqual(0);
  });

  describe("_insertEdge", () => {
    // rail node に edge を挿入する
    describe("insert edge (not forward station) from dept task", () => {
      // from -> e1 -> to
      var from: RailNode;
      var to: RailNode;
      var e1: RailEdge;
      var e2: RailEdge;
      var l: RailLine;
      var dept: LineTask;

      beforeEach(() => {
        from = new RailNode(0, 0);
        const p = from._buildStation();
        e1 = from._extend(3, 4);
        e2 = e1.reverse;
        to = e1.to;
        l = new RailLine();
        l._start(p);
        dept = l.top;
        // from -> [dept] -> from -> [outbound] -> to -> [inbound] -> from
        dept._insertEdge(e1);
      });

      it("'outbound' task refers to 'e1'", () => {
        const _outbound = dept.next;

        expect(_outbound).toBeInstanceOf(EdgeTask);
        const outbound = _outbound as EdgeTask;

        expect(outbound.parent).toEqual(l);
        expect(outbound.edge).toEqual(e1);
        expect(outbound._getDept()).toEqual(from);
        expect(outbound._getDest()).toEqual(to);
        expect(outbound._getLength()).toEqual(e1.length);
      });

      it("'outbound' task is setted between 'dept' and 'inbound' task", () => {
        const outbound = dept.next;

        expect(outbound.prev).toEqual(dept);
        expect(outbound.next).not.toBeUndefined();
        expect(outbound.next).not.toEqual(dept);
      });

      it("'inbound' task refers to 'e2'", () => {
        const _inbound = dept.next.next;

        expect(_inbound).toBeInstanceOf(EdgeTask);
        const inbound = _inbound as EdgeTask;

        expect(inbound.parent).toEqual(l);
        expect(inbound.edge).toEqual(e2);
        expect(inbound._getDept()).toEqual(to);
        expect(inbound._getDest()).toEqual(from);
      });

      it("'inbound' task is setted between 'outbound' and 'dept' task", () => {
        const inbound = dept.next.next;
        expect(inbound.prev).toEqual(dept.next);
        expect(inbound.next).toEqual(dept);
        expect(dept.prev).toEqual(inbound);
      });
    });

    describe("insert edge (forward station) from dept task", () => {
      var from: RailNode;
      var to: RailNode;
      var p2: Platform;
      var l: RailLine;
      beforeEach(() => {
        from = new RailNode(0, 0);
        const p1 = from._buildStation();
        const edge = from._extend(3, 4);
        to = edge.to;
        p2 = to._buildStation();

        l = new RailLine();
        l._start(p1);
        l.top._insertEdge(edge);
      });

      it("1. depart from 'from'", () => {
        const dept = l.top;
        expect(dept).toBeInstanceOf(DeptTask);
        expect(dept._getDept()).toEqual(from);
        expect(dept._getDest()).toEqual(from);
      });

      it("2. move from 'from' to 'to'", () => {
        const outbound = l.top.next;
        expect(outbound).toBeInstanceOf(EdgeTask);
        expect(outbound._getDept()).toEqual(from);
        expect(outbound._getDest()).toEqual(to);
        expect(outbound.prev).toEqual(l.top);
      });

      it("3. depart from 'to'", () => {
        const dept = l.top.next.next;
        expect(dept).toBeInstanceOf(DeptTask);
        expect(dept._getDept()).toEqual(to);
        expect(dept._getDest()).toEqual(to);
        expect(dept.prev).toEqual(l.top.next);
      });

      it("4. move from 'to' to 'from'", () => {
        const inbound = l.top.next.next.next;
        expect(inbound).toBeInstanceOf(EdgeTask);
        expect(inbound._getDept()).toEqual(to);
        expect(inbound._getDest()).toEqual(from);
        expect(inbound.prev).toEqual(l.top.next.next);
        expect(inbound.next).toEqual(l.top);
      });
    });

    describe("insert edge (not forward station) from edge task", () => {
      // 1. rn1 -> [e12] -> rn2
      // 2. rn1 -> [e12] -> rn2 -> [e23] -> rn3
      var e23: RailEdge;
      var l: RailLine;
      beforeEach(() => {
        // 1.
        const rn1 = new RailNode(0, 0);
        const p1 = rn1._buildStation();
        const e12 = rn1._extend(3, 4);

        // 1. を 路線に追加
        l = new RailLine();
        l._start(p1);
        l.top._insertEdge(e12);
        const outbound = l.top.next;
        expect(outbound).toBeInstanceOf(EdgeTask);
        expect((outbound as EdgeTask).edge).toEqual(e12);

        // 2.
        e23 = e12.to._extend(6, 8);

        // 2. を路線に追加
        outbound._insertEdge(e23);
      });

      it("move from 'rn2' to 'rn3", () => {
        const e23task = l.top.next.next;
        expect(e23task).toBeInstanceOf(EdgeTask);
        expect((e23task as EdgeTask).edge).toEqual(e23);
        expect(e23task._getDept()).toEqual(e23.from);
        expect(e23task._getDest()).toEqual(e23.to);
        expect(e23task.prev).toEqual(l.top.next);
      });

      it("move from 'rn3' to 'rn2", () => {
        const e32task = l.top.next.next.next;
        const e32 = e23.reverse;
        expect(e32task).toBeInstanceOf(EdgeTask);
        expect((e32task as EdgeTask).edge).toEqual(e32);
        expect(e32task._getDept()).toEqual(e32.from);
        expect(e32task._getDest()).toEqual(e32.to);
        expect(e32task.prev).toEqual(l.top.next.next);
        expect(e32task.next).toEqual(l.top.prev);
      });
    });

    describe("insert edge (forward station) from edge task", () => {
      // 1. rn1 -> [e12] -> rn2
      // 2. rn1 -> [e12] -> rn2 -> [e23] -> rn3
      var e23: RailEdge;
      var l: RailLine;
      beforeEach(() => {
        // 1.
        const rn1 = new RailNode(0, 0);
        const p1 = rn1._buildStation();
        const e12 = rn1._extend(3, 4);

        // 1. を 路線に追加
        l = new RailLine();
        l._start(p1);
        l.top._insertEdge(e12);
        const outbound = l.top.next;
        expect(outbound).toBeInstanceOf(EdgeTask);
        expect((outbound as EdgeTask).edge).toEqual(e12);

        // 2.
        e23 = e12.to._extend(6, 8);
        e23.to._buildStation();

        // 2. を路線に追加
        outbound._insertEdge(e23);
      });

      it("move from 'rn2' to 'rn3", () => {
        const e23task = l.top.next.next;
        expect(e23task).toBeInstanceOf(EdgeTask);
        expect((e23task as EdgeTask).edge).toEqual(e23);
        expect(e23task._getDept()).toEqual(e23.from);
        expect(e23task._getDest()).toEqual(e23.to);
        expect(e23task.prev).toEqual(l.top.next);
      });

      it("dept from 'rn3", () => {
        const dept = l.top.next.next.next;
        const rn3 = e23.to;
        const p3 = rn3.platform;
        expect(dept).toBeInstanceOf(DeptTask);
        expect((dept as DeptTask).stay).toEqual(p3);
        expect(dept._getDept()).toEqual(rn3);
        expect(dept._getDest()).toEqual(rn3);
        expect(dept.prev).toEqual(l.top.next.next);
      });

      it("move from 'rn3' to 'rn2", () => {
        const e32task = l.top.next.next.next.next;
        const e32 = e23.reverse;
        expect(e32task).toBeInstanceOf(EdgeTask);
        expect((e32task as EdgeTask).edge).toEqual(e32);
        expect(e32task._getDept()).toEqual(e32.from);
        expect(e32task._getDest()).toEqual(e32.to);
        expect(e32task.prev).toEqual(l.top.next.next.next);
        expect(e32task.next).toEqual(l.top.prev);
      });
    });

    describe("insert dept task on the station task", () => {
      // rn1 -> [e12] -> rn2 -> [e23] -> rn3
      var e12: RailEdge;
      var e23: RailEdge;
      var l: RailLine;

      beforeEach(() => {
        const rn1 = new RailNode(0, 0);
        rn1._buildStation();
        e12 = rn1._extend(1, 2);
        const rn2 = e12.to;
        rn2._buildStation();
        e23 = rn2._extend(2, 3);

        l = new RailLine();
        l._start(rn1.platform);
        const dept1 = l.top;
        l.top._insertEdge(e12);
        const move12 = dept1.next;
        const dept2 = move12.next;
        dept2._insertEdge(e23);
      });

      it("dept from 'rn1'", () => {
        const dept1 = l.top;
        expect(dept1).toBeInstanceOf(DeptTask);
        expect((dept1 as DeptTask).stay).toEqual(e12.from.platform);
        expect(dept1._getDept()).toEqual(e12.from);
        expect(dept1._getDest()).toEqual(e12.from);
      });

      it("move from 'rn1' to 'rn2", () => {
        const move12 = l.top.next;
        expect(move12).toBeInstanceOf(EdgeTask);
        expect((move12 as EdgeTask).edge).toEqual(e12);
        expect(move12._getDept()).toEqual(e12.from);
        expect(move12._getDest()).toEqual(e12.to);
        expect(move12.prev).toEqual(l.top);
      });

      it("dept from 'rn2'", () => {
        const dept2 = l.top.next.next;
        expect(dept2).toBeInstanceOf(DeptTask);
        expect((dept2 as DeptTask).stay).toEqual(e12.to.platform);
        expect(dept2._getDept()).toEqual(e12.to);
        expect(dept2._getDest()).toEqual(e12.to);
        expect(dept2.prev).toEqual(l.top.next);
      });

      it("move from 'rn2' to 'rn3", () => {
        const move23 = l.top.next.next.next;
        expect(move23).toBeInstanceOf(EdgeTask);
        expect((move23 as EdgeTask).edge).toEqual(e23);
        expect(move23._getDept()).toEqual(e23.from);
        expect(move23._getDest()).toEqual(e23.to);
        expect(move23.prev).toEqual(l.top.next.next);
      });
    });

    it("forbit to insert un-neighbored edge from dept task", () => {
      const rn1 = new RailNode(0, 0);
      rn1._extend(0, 0);
      const p1 = rn1._buildStation();
      const rn2 = new RailNode(0, 0);
      const e2 = rn2._extend(0, 0);

      const l = new RailLine();
      l._start(p1);
      l.top._insertEdge(e2);
      expect(l.top.next).toEqual(l.top);
    });

    it("forbit to insert un-neighbored edge from edge task", () => {
      const rn1 = new RailNode(0, 0);
      const e1 = rn1._extend(0, 0);
      const p1 = rn1._buildStation();
      const rn2 = new RailNode(0, 0);
      const e2 = rn2._extend(0, 0);

      const l = new RailLine();
      l._start(p1);
      l._insertEdge(e1);
      l.top.next._insertEdge(e2);
      expect(l.top.next.next.next).toEqual(l.top);
    });
  });

  describe("_insertPlatform", () => {
    var l: RailLine;
    var dept: LineTask;
    var outbound: LineTask;
    var inbound: LineTask;

    beforeEach(() => {
      const rn1 = new RailNode(0, 0);
      const p1 = rn1._buildStation();
      const e12 = rn1._extend(3, 4);
      const rn2 = e12.to;

      l = new RailLine();
      l._start(p1);
      l.top._insertEdge(e12);
      outbound = l.top.next;
      expect(outbound._getDept()).toEqual(rn1);
      expect(outbound._getDest()).toEqual(rn2);

      inbound = l.top.prev;
      expect(inbound._getDept()).toEqual(rn2);
      expect(inbound._getDest()).toEqual(rn1);

      const p2 = e12.to._buildStation();
      outbound._insertPlatform(p2);
      dept = outbound.next;
    });

    it("ok", () => {
      expect(dept).toBeInstanceOf(DeptTask);
      expect(dept.parent).toEqual(l);
      expect(dept.prev).toEqual(outbound);
      expect(dept.next).toEqual(inbound);
    });

    it("forbit un-neighbored platform", () => {
      const rn = new RailNode(999, 999);
      const p = rn._buildStation();

      const expectedNext = outbound.next;

      outbound._insertPlatform(p);
      expect(outbound.next).toEqual(expectedNext);
    });

    it("forbit duplicated dept task", () => {
      const rn = new RailNode(999, 999);
      const p = rn._buildStation();

      const expectedNext = dept.next;

      dept._insertPlatform(p);
      expect(dept.next).toEqual(expectedNext);
    });
  });
});
