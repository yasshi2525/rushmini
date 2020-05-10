import ActionProxy from "models/action";
import DeptTask from "models/dept_task";
import EdgeTask from "models/edge_task";
import Gate from "models/gate";
import modelListener, { EventType } from "models/listener";
import Platform from "models/platform";
import RailEdge from "models/rail_edge";
import RailNode from "models/rail_node";
import Station from "models/station";
import Train from "models/train";
import { remove } from "utils/common";

describe("action", () => {
  describe("physical rail", () => {
    let rns: RailNode[];
    let res: RailEdge[];
    let sts: Station[];
    let ps: Platform[];
    let gs: Gate[];
    let depts: DeptTask[];
    let edges: EdgeTask[];
    let ts: Train[];

    beforeEach(() => {
      rns = [];
      res = [];
      sts = [];
      ps = [];
      gs = [];
      depts = [];
      edges = [];
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
        .register((d) => depts.push(d));
      modelListener
        .find(EventType.CREATED, EdgeTask)
        .register((e) => edges.push(e));
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
        .register((d) => remove(depts, d));
      modelListener
        .find(EventType.DELETED, EdgeTask)
        .register((e) => remove(edges, e));
      modelListener
        .find(EventType.DELETED, Train)
        .register((t) => remove(ts, t));
    });

    afterEach(() => {
      modelListener.flush();
      modelListener.unregisterAll();
    });
    it("create rail node", () => {
      const proxy = new ActionProxy();
      proxy.startRail(3, 4);
      modelListener.fire(EventType.CREATED);
      expect(rns).toEqual([proxy.tail()]);
      expect(proxy.tail().loc().x).toEqual(3);
      expect(proxy.tail().loc().y).toEqual(4);
    });

    it("rollback creating rail node", () => {
      const proxy = new ActionProxy();
      proxy.startRail(3, 4);
      modelListener.fire(EventType.CREATED);
      proxy.rollback();
      modelListener.fire(EventType.MODIFIED);
      modelListener.fire(EventType.DELETED);
      expect(rns.length).toEqual(0);
      expect(proxy.tail()).toBeUndefined();
    });

    it("extend rail node", () => {
      const proxy = new ActionProxy();
      proxy.startRail(3, 4);
      proxy.extendRail(6, 8);
      modelListener.fire(EventType.CREATED);
      modelListener.fire(EventType.MODIFIED);
      expect(proxy.tail().loc().x).toEqual(6);
      expect(proxy.tail().loc().y).toEqual(8);
      expect(rns.length).toEqual(2);
      expect(res.length).toEqual(2);
    });

    it("rollback extending rail node", () => {
      const proxy = new ActionProxy();
      proxy.startRail(3, 4);
      proxy.commit();
      proxy.extendRail(6, 8);
      modelListener.fire(EventType.CREATED);
      modelListener.fire(EventType.MODIFIED);
      proxy.rollback();
      modelListener.fire(EventType.MODIFIED);
      modelListener.fire(EventType.DELETED);
      expect(proxy.tail().out.length).toEqual(0);
      expect(proxy.tail().in.length).toEqual(0);
      expect(rns).toEqual([proxy.tail()]);
      expect(res.length).toEqual(0);
    });

    it("build station", () => {
      const proxy = new ActionProxy();
      const tail = proxy.startRail(3, 4);
      proxy.buildStation();
      modelListener.fire(EventType.CREATED);
      expect(ps.length).toEqual(1);
      expect(gs.length).toEqual(1);
      expect(sts.length).toEqual(1);
    });

    it("rollback building station", () => {
      const proxy = new ActionProxy();
      proxy.startRail(3, 4);
      proxy.commit();
      proxy.buildStation();
      modelListener.fire(EventType.CREATED);
      proxy.rollback();
      modelListener.fire(EventType.MODIFIED);
      modelListener.fire(EventType.DELETED);
      expect(proxy.tail().platform).toBeUndefined();
      expect(ps.length).toEqual(0);
      expect(gs.length).toEqual(0);
      expect(sts.length).toEqual(0);
    });

    it("rollback building specific station", () => {
      const proxy = new ActionProxy();
      proxy.startRail(3, 4);
      proxy.extendRail(6, 8);
      const rn2 = proxy.tail();
      proxy.extendRail(9, 12);
      const tail = proxy.tail();
      proxy.commit();

      proxy.buildStation(rn2);
      modelListener.fire(EventType.CREATED);
      modelListener.fire(EventType.MODIFIED);

      expect(proxy.tail()).toEqual(rn2);

      proxy.rollback();
      modelListener.fire(EventType.MODIFIED);
      modelListener.fire(EventType.DELETED);

      expect(proxy.tail()).toEqual(tail);
      expect(ps.length).toEqual(0);
      expect(gs.length).toEqual(0);
      expect(sts.length).toEqual(0);
    });

    it("create line", () => {
      const proxy = new ActionProxy();
      proxy.startRail(3, 4);
      proxy.buildStation();
      proxy.startLine();
      modelListener.fire(EventType.CREATED);
      expect(proxy.line().top.next).toEqual(proxy.line().top);
      expect(depts).toEqual([proxy.line().top]);
    });

    it("rollback creating line", () => {
      const proxy = new ActionProxy();
      proxy.startRail(3, 4);
      proxy.buildStation();
      proxy.commit();
      proxy.startLine();
      modelListener.fire(EventType.CREATED);
      proxy.rollback();
      modelListener.fire(EventType.DELETED);
      expect(proxy.line().top).toBeUndefined();
      expect(depts.length).toEqual(0);
    });

    it("insert edge to only dept line", () => {
      const proxy = new ActionProxy();
      proxy.startRail(3, 4);
      proxy.buildStation();
      proxy.startLine();
      const dept = proxy.line().top;
      proxy.extendRail(6, 8);
      proxy.insertEdge();
      modelListener.fire(EventType.CREATED);
      modelListener.fire(EventType.MODIFIED);
      expect(depts).toEqual([dept]);
      expect(edges).toEqual([dept.next, dept.next.next]);
    });

    it("rollback inserting edge to only dept line", () => {
      const proxy = new ActionProxy();
      proxy.startRail(3, 4);
      proxy.buildStation();
      proxy.startLine();
      const dept = proxy.line().top;
      proxy.extendRail(6, 8);
      proxy.commit();
      proxy.insertEdge();
      modelListener.fire(EventType.CREATED);
      modelListener.fire(EventType.MODIFIED);
      proxy.rollback();
      modelListener.fire(EventType.MODIFIED);
      modelListener.fire(EventType.DELETED);
      expect(depts).toEqual([dept]);
      expect(dept.next).toEqual(dept);
      expect(dept.prev).toEqual(dept);
    });

    it("rollback inserting edge to edge line", () => {
      const proxy = new ActionProxy();
      proxy.startRail(3, 4);
      proxy.buildStation();
      proxy.startLine();
      proxy.extendRail(6, 8);
      proxy.insertEdge();
      const dept = proxy.line().top;
      const outbound = dept.next;
      const inbound = outbound.next;
      proxy.extendRail(8, 12);
      proxy.commit();
      proxy.insertEdge();
      modelListener.fire(EventType.CREATED);
      modelListener.fire(EventType.MODIFIED);
      proxy.rollback();
      modelListener.fire(EventType.MODIFIED);
      modelListener.fire(EventType.DELETED);
      expect(depts).toEqual([dept]);
      expect(edges).toEqual([outbound, inbound]);
      expect(outbound.next).toEqual(inbound);
      expect(inbound.prev).toEqual(outbound);
    });

    it("rollback inserting edge to station line", () => {
      const proxy = new ActionProxy();
      proxy.startRail(3, 4);
      proxy.buildStation();
      proxy.startLine();
      proxy.extendRail(6, 8);
      proxy.buildStation();
      proxy.insertEdge();
      const dept1 = proxy.line().top;
      const outbound = dept1.next;
      const dept2 = outbound.next;
      const inbound = dept2.next;
      proxy.extendRail(8, 12);
      proxy.commit();
      proxy.insertEdge();
      modelListener.fire(EventType.CREATED);
      modelListener.fire(EventType.MODIFIED);
      proxy.rollback();
      modelListener.fire(EventType.MODIFIED);
      modelListener.fire(EventType.DELETED);
      expect(depts).toEqual([dept1, dept2]);
      expect(edges).toEqual([outbound, inbound]);
      expect(outbound.next).toEqual(dept2);
      expect(dept2.next).toEqual(inbound);
    });

    it("rollback inserting station", () => {
      const proxy = new ActionProxy();
      proxy.startRail(3, 4);
      proxy.buildStation();
      proxy.startLine();

      proxy.extendRail(6, 8);
      proxy.insertEdge();
      proxy.buildStation();

      proxy.commit();

      proxy.insertPlatform();
      modelListener.fire(EventType.CREATED);
      modelListener.fire(EventType.MODIFIED);

      proxy.rollback();
      modelListener.fire(EventType.MODIFIED);
      modelListener.fire(EventType.DELETED);

      expect(sts.length).toEqual(2);
      expect(depts.length).toEqual(1);
      expect(edges.length).toEqual(2);
    });

    it("rollback inserting specified station", () => {
      const proxy = new ActionProxy();
      proxy.startRail(3, 4);
      proxy.buildStation();
      proxy.startLine();

      proxy.extendRail(6, 8);
      proxy.insertEdge();

      const rn2 = proxy.tail();

      proxy.extendRail(9, 12);
      proxy.insertEdge();
      proxy.buildStation(rn2);

      proxy.commit();

      proxy.insertPlatform(rn2.platform);
      modelListener.fire(EventType.CREATED);
      modelListener.fire(EventType.MODIFIED);

      proxy.rollback();
      modelListener.fire(EventType.MODIFIED);
      modelListener.fire(EventType.DELETED);

      expect(sts.length).toEqual(2);
      expect(depts.length).toEqual(1);
      expect(edges.length).toEqual(4);
    });

    it("rollback branch", () => {
      const proxy = new ActionProxy();
      proxy.startRail(3, 4);
      proxy.buildStation();
      proxy.startLine();

      proxy.extendRail(6, 8);
      proxy.buildStation();
      proxy.insertEdge();

      const p2 = proxy.tail().platform;
      expect(p2.loc().x).toEqual(6);
      expect(p2.loc().y).toEqual(8);

      proxy.extendRail(9, 12);
      proxy.buildStation();
      proxy.insertEdge();

      const tail = proxy.tail();

      proxy.commit();

      proxy.startBranch(p2);
      proxy.extendRail(12, 16);
      proxy.insertEdge();

      modelListener.fire(EventType.CREATED);
      modelListener.fire(EventType.MODIFIED);

      expect(proxy.tail().loc().x).toEqual(12);
      expect(proxy.tail().loc().y).toEqual(16);
      expect(proxy.tail().in.length).toEqual(1);
      expect(proxy.tail().in[0].to).toEqual(proxy.tail());
      expect(proxy.tail().in[0].from.loc().x).toEqual(6);
      expect(proxy.tail().in[0].from.loc().y).toEqual(8);
      expect(proxy.tail().in[0].from).toEqual(p2.on);

      proxy.rollback();
      modelListener.fire(EventType.MODIFIED);
      modelListener.fire(EventType.DELETED);

      expect(proxy.tail()).toEqual(tail);
    });
  });
});
