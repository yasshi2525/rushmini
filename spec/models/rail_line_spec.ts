import RailLine from "models/rail_line";
import RailNode from "models/rail_node";
import DeptTask from "models/dept_task";
import RailEdge from "models/rail_edge";
import EdgeTask from "models/edge_task";
import modelListener from "models/listener";

afterAll(() => {
  modelListener.flush();
});

describe("rail_line", () => {
  it("creation", () => {
    const l = new RailLine();
    expect(l.top).toBeUndefined();
  });

  describe("_start", () => {
    it("create dept task", () => {
      const l = new RailLine();
      const rn = new RailNode(0, 0);
      const p = rn._buildStation();
      l._start(p);

      expect(l.top).toBeInstanceOf(DeptTask);
      expect(l.top._getDept()).toEqual(rn);
      expect(l.top._getDest()).toEqual(rn);
    });

    it("forbit duplicated starting", () => {
      const l = new RailLine();
      const from = new RailNode(0, 0);
      const to = new RailNode(3, 4);
      const p1 = from._buildStation();
      const p2 = to._buildStation();
      l._start(p1);
      l._start(p2);

      expect(l.top._getDept().platform).toEqual(p1);
    });
  });

  describe("_insertEdge", () => {
    // 延伸 rn1 -> [e12] -> rn2 の rn2 に [e23] を追加
    // 分岐 rn1 -> [e12] -> rn2 -> [e23] -> rn3 の rn2 に [e2L/R] を追加
    //      rn1 -> rn2 -> rnL -> rn3 -> rn1 となることを確認 (rnLが左側にある)
    //      rn1 -> rn2 -> rn3 -> rnR -> rn1 となることを確認 (rnRが右側にある)

    var rn1: RailNode;
    var e12: RailEdge;
    var rn2: RailNode;
    var rn3: RailNode;
    var e23: RailEdge;
    var rnL: RailNode;
    var e2L: RailEdge;
    var rnR: RailNode;
    var e2R: RailEdge;

    var rnLN: RailNode;
    var e2LN: RailEdge;

    var l: RailLine;

    //     rnL rnLN
    // rn1 rn2 rn3
    //     rnR

    beforeEach(() => {
      rn1 = new RailNode(0, 0);
      rn1._buildStation();
      e12 = rn1._extend(1, 0);
      rn2 = e12.to;
      e23 = rn2._extend(2, 0);
      rn3 = e23.to;
      e2L = rn2._extend(1, -1);
      rnL = e2L.to;
      e2R = rn2._extend(1, 1);
      rnR = e2R.to;

      e2LN = rn2._extend(2, -1);
      rnLN = e2LN.to;

      l = new RailLine();
    });

    it("forbit to set edge to empty line", () => {
      l._insertEdge(e12);
      expect(l.top).toBeUndefined();
    });

    it("extend EdgeTask", () => {
      l._start(rn1.platform);
      l._insertEdge(e12);
      expect(l.top.next).toBeInstanceOf(EdgeTask);
      expect((l.top.next as EdgeTask).edge).toEqual(e12);
      expect(l.top.next._getDept()).toEqual(rn1);
      expect(l.top.next._getDest()).toEqual(rn2);
      expect(l.top.next.next).toBeInstanceOf(EdgeTask);
      expect((l.top.next.next as EdgeTask).edge).toEqual(e12.reverse);
      expect(l.top.next.next.next).toEqual(l.top);
    });

    it("re-rextend EdgeTask", () => {
      l._start(rn1.platform);
      l._insertEdge(e12);
      l._insertEdge(e23);

      const lt12 = l.top.next;
      expect(lt12._getDept()).toEqual(rn1);
      expect(lt12._getDest()).toEqual(rn2);
      const lt23 = lt12.next;
      expect(lt23._getDept()).toEqual(rn2);
      expect(lt23._getDest()).toEqual(rn3);
      const lt32 = lt23.next;
      expect(lt32._getDept()).toEqual(rn3);
      expect(lt32._getDest()).toEqual(rn2);
      const lt21 = lt32.next;
      expect(lt21._getDept()).toEqual(rn2);
      expect(lt21._getDest()).toEqual(rn1);
      expect(lt21.next).toEqual(l.top);
    });

    it("insert Edge on the left hand", () => {
      // rn1 -> rn2 -> rnL -> rn3 -> rn2 -> rn1
      l._start(rn1.platform);
      l._insertEdge(e12);
      l._insertEdge(e23);
      l._insertEdge(e2L);

      const lt12 = l.top.next;
      expect(lt12._getDept()).toEqual(rn1);
      expect(lt12._getDest()).toEqual(rn2);

      const lt2L = lt12.next;
      expect(lt2L._getDept()).toEqual(rn2);
      expect(lt2L._getDest()).toEqual(rnL);
      const ltL2 = lt2L.next;
      expect(ltL2._getDept()).toEqual(rnL);
      expect(ltL2._getDest()).toEqual(rn2);

      const lt23 = ltL2.next;
      expect(lt23._getDept()).toEqual(rn2);
      expect(lt23._getDest()).toEqual(rn3);
      const lt32 = lt23.next;
      expect(lt32._getDept()).toEqual(rn3);
      expect(lt32._getDest()).toEqual(rn2);

      const lt21 = lt32.next;
      expect(lt21._getDept()).toEqual(rn2);
      expect(lt21._getDest()).toEqual(rn1);
      expect(lt21.next).toEqual(l.top);
    });

    it("insert Edge on the right hand", () => {
      // rn1 -> rn2  -> rn3 -> rn2 -> rnR -> rn2 -> rn1
      l._start(rn1.platform);
      l._insertEdge(e12);
      l._insertEdge(e23);
      l._insertEdge(e2R);
      const lt12 = l.top.next;
      expect(lt12._getDept()).toEqual(rn1);
      expect(lt12._getDest()).toEqual(rn2);

      const lt23 = lt12.next;
      expect(lt23._getDept()).toEqual(rn2);
      expect(lt23._getDest()).toEqual(rn3);
      const lt32 = lt23.next;
      expect(lt32._getDept()).toEqual(rn3);
      expect(lt32._getDest()).toEqual(rn2);

      const lt2R = lt32.next;
      expect(lt2R._getDept()).toEqual(rn2);
      expect(lt2R._getDest()).toEqual(rnR);
      const ltR2 = lt2R.next;
      expect(ltR2._getDept()).toEqual(rnR);
      expect(ltR2._getDest()).toEqual(rn2);

      const lt21 = ltR2.next;
      expect(lt21._getDept()).toEqual(rn2);
      expect(lt21._getDest()).toEqual(rn1);
      expect(lt21.next).toEqual(l.top);
    });

    it("insert Edge on branch node", () => {
      // rn1 -> rn2 -> rnL -> rn2 -> rnLN -> rn2 -> rn3 -> rn2 -> rn1
      l._start(rn1.platform);
      l._insertEdge(e12);
      l._insertEdge(e23);
      l._insertEdge(e2L);
      l._insertEdge(e2LN);

      const lt12 = l.top.next;
      expect(lt12._getDept()).toEqual(rn1);
      expect(lt12._getDest()).toEqual(rn2);

      const lt2L = lt12.next;
      expect(lt2L._getDept()).toEqual(rn2);
      expect(lt2L._getDest()).toEqual(rnL);
      const ltL2 = lt2L.next;
      expect(ltL2._getDept()).toEqual(rnL);
      expect(ltL2._getDest()).toEqual(rn2);

      const lt2LN = ltL2.next;
      expect(lt2LN._getDept()).toEqual(rn2);
      expect(lt2LN._getDest()).toEqual(rnLN);
      const ltLN2 = lt2LN.next;
      expect(ltLN2._getDept()).toEqual(rnLN);
      expect(ltLN2._getDest()).toEqual(rn2);

      const lt23 = ltLN2.next;
      expect(lt23._getDept()).toEqual(rn2);
      expect(lt23._getDest()).toEqual(rn3);
      const lt32 = lt23.next;
      expect(lt32._getDept()).toEqual(rn3);
      expect(lt32._getDest()).toEqual(rn2);

      const lt21 = lt32.next;
      expect(lt21._getDept()).toEqual(rn2);
      expect(lt21._getDest()).toEqual(rn1);
      expect(lt21.next).toEqual(l.top);
    });

    it("insert edge from station node", () => {
      // rn1 -> rn2 -> rn3
      rn2._buildStation();
      l._start(rn1.platform);
      l._insertEdge(e12);
      l._insertEdge(e23);
      l._insertEdge(e2R);

      const lt12 = l.top.next;
      expect(lt12._getDept()).toEqual(rn1);
      expect(lt12._getDest()).toEqual(rn2);

      const dept23 = lt12.next;
      expect(dept23._getDept()).toEqual(rn2);
      expect(dept23._getDest()).toEqual(rn2);

      const lt23 = dept23.next;
      expect(lt23._getDept()).toEqual(rn2);
      expect(lt23._getDest()).toEqual(rn3);
      const lt32 = lt23.next;
      expect(lt32._getDept()).toEqual(rn3);
      expect(lt32._getDest()).toEqual(rn2);

      const dept2R = lt32.next;
      expect(dept2R._getDept()).toEqual(rn2);
      expect(dept2R._getDest()).toEqual(rn2);

      const lt2R = dept2R.next;
      expect(lt2R._getDept()).toEqual(rn2);
      expect(lt2R._getDest()).toEqual(rnR);

      const ltR2 = lt2R.next;
      expect(ltR2._getDept()).toEqual(rnR);
      expect(ltR2._getDest()).toEqual(rn2);

      const dept21 = ltR2.next;
      expect(dept21._getDept()).toEqual(rn2);
      expect(dept21._getDest()).toEqual(rn2);

      const lt21 = dept21.next;
      expect(lt21._getDept()).toEqual(rn2);
      expect(lt21._getDest()).toEqual(rn1);
      expect(lt21.next).toEqual(l.top);
    });

    it("skip length=0 move task to insert", () => {
      // rn1 -> rn2 = rnX -> rn3
      const e2X = rn2._extend(rn2.x, rn2.y);
      const rnX = e2X.to;
      l._start(rn1.platform);
      l._insertEdge(e12);
      l._insertEdge(e2X);
      l._insertEdge(e23);

      const lt12 = l.top.next;
      expect(lt12._getDept()).toEqual(rn1);
      expect(lt12._getDest()).toEqual(rn2);

      const lt23 = lt12.next;
      expect(lt23._getDept()).toEqual(rn2);
      expect(lt23._getDest()).toEqual(rn3);
      const lt32 = lt23.next;
      expect(lt32._getDept()).toEqual(rn3);
      expect(lt32._getDest()).toEqual(rn2);

      const lt2X = lt32.next;
      expect(lt2X._getDept()).toEqual(rn2);
      expect(lt2X._getDest()).toEqual(rnX);
      const ltX2 = lt2X.next;
      expect(ltX2._getDept()).toEqual(rnX);
      expect(ltX2._getDest()).toEqual(rn2);

      const lt21 = ltX2.next;
      expect(lt21._getDept()).toEqual(rn2);
      expect(lt21._getDest()).toEqual(rn1);
      expect(lt21.next).toEqual(l.top);
    });

    it("forbit to insert un-neighbored edge to initial rail line", () => {
      l._start(rn1.platform);
      const rnX = new RailNode(0, 0);
      const eX = rnX._extend(0, 0);
      l._insertEdge(eX);

      expect(l.top.next).toEqual(l.top);
    });

    it("forbit to insert un-neighbored edge", () => {
      l._start(rn1.platform);
      l._insertEdge(e12);
      const rnX = new RailNode(0, 0);
      const eX = rnX._extend(0, 0);
      l._insertEdge(eX);

      expect(l.top._getDest()).not.toEqual(rnX);
      expect(l.top.next._getDest()).not.toEqual(rnX);
      expect(l.top.next.next._getDest()).not.toEqual(rnX);
      expect(l.top.next.next.next._getDest()).not.toEqual(rnX);
      expect(l.top.next.next.next.next._getDest()).not.toEqual(rnX);
    });

    it("insert 0-length edge", () => {
      const rnX = new RailNode(0, 0);
      rnX._buildStation();
      const eX = rnX._extend(0, 0);
      l._start(rnX.platform);
      l._insertEdge(eX);

      expect(l.top.next).toBeInstanceOf(EdgeTask);
      expect((l.top.next as EdgeTask).edge).toEqual(eX);
    });

    it("insert edge after 0-length edge", () => {
      // rnX = [eXY] - rnY - [eYZ] - rnZ
      const rnX = new RailNode(0, 0);
      rnX._buildStation();
      const eXY = rnX._extend(0, 0);
      const rnY = eXY.to;
      const eYZ = rnY._extend(1, 0);
      const rnZ = eYZ.to;
      l._start(rnX.platform);
      l._insertEdge(eXY);
      l._insertEdge(eYZ);

      const ltXY = l.top.next;
      expect(ltXY).toBeInstanceOf(EdgeTask);
      expect((ltXY as EdgeTask).edge).toEqual(eXY);

      const ltYZ = ltXY.next;
      expect(ltYZ).toBeInstanceOf(EdgeTask);
      expect((ltYZ as EdgeTask).edge).toEqual(eYZ);

      const ltZY = ltYZ.next;
      expect(ltZY).toBeInstanceOf(EdgeTask);
      expect((ltZY as EdgeTask).edge).toEqual(eYZ.reverse);

      const ltYX = ltZY.next;
      expect(ltYX).toBeInstanceOf(EdgeTask);
      expect((ltYX as EdgeTask).edge).toEqual(eXY.reverse);
      expect(ltYX.next).toEqual(l.top);
    });
  });

  describe("_insertPlatform", () => {
    // rn1 -> rn2 -> rn3
    var rn1: RailNode;
    var rn2: RailNode;
    var rn3: RailNode;
    var e12: RailEdge;
    var e23: RailEdge;
    var l: RailLine;

    beforeEach(() => {
      rn1 = new RailNode(0, 0);
      rn1._buildStation();
      e12 = rn1._extend(3, 4);
      rn2 = e12.to;
      e23 = rn2._extend(6, 8);
      rn3 = e23.to;
      l = new RailLine();
    });

    it("ok", () => {
      l._start(rn1.platform);
      l._insertEdge(e12);
      l._insertEdge(e23);

      rn2._buildStation();
      l._insertPlatform(rn2.platform);

      const lt12 = l.top.next;
      expect(lt12._getDept()).toEqual(rn1);
      expect(lt12._getDest()).toEqual(rn2);

      const dept23 = lt12.next;
      expect(dept23._getDept()).toEqual(rn2);
      expect(dept23._getDest()).toEqual(rn2);

      const lt23 = dept23.next;
      expect(lt23._getDept()).toEqual(rn2);
      expect(lt23._getDest()).toEqual(rn3);
      const lt32 = lt23.next;
      expect(lt32._getDept()).toEqual(rn3);
      expect(lt32._getDest()).toEqual(rn2);

      const dept21 = lt32.next;
      expect(dept21._getDept()).toEqual(rn2);
      expect(dept21._getDest()).toEqual(rn2);

      const lt21 = dept21.next;
      expect(lt21._getDept()).toEqual(rn2);
      expect(lt21._getDest()).toEqual(rn1);
      expect(lt21.next).toEqual(l.top);
    });

    it("forbit to insert platform to empty line", () => {
      l._insertPlatform(rn1.platform);
      expect(l.top).toBeUndefined();
    });
  });
});
