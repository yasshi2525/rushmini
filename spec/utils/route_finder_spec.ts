import Company from "models/company";
import DeptTask from "models/dept_task";
import Gate from "models/gate";
import Human, { HumanState } from "models/human";
import LineTask from "models/line_task";
import modelListener, { EventType } from "models/listener";
import Platform from "models/platform";
import Point from "models/point";
import { Pointable } from "models/pointable";
import RailNode from "models/rail_node";
import Residence from "models/residence";
import { Routable } from "models/routable";
import Train from "models/train";
import userResource, { UserResource } from "models/user_resource";
import { find } from "utils/common";
import routeFinder from "utils/route_finder";
import ticker from "utils/ticker";
import transportFinder from "utils/transport_finder";

const FPS = 15;

beforeAll(() => {
  ticker.init(FPS);
});

describe("route_finder", () => {
  let ts: Train[];
  describe("no transfer", () => {
    beforeEach(() => {
      ts = [];
      modelListener.find(EventType.CREATED, Train).register((t) => ts.push(t));
      userResource.init();
    });

    afterEach(() => {
      userResource.reset();
      modelListener.flush();
      modelListener.unregisterAll();
      userResource.stateListeners.length = 0;
      routeFinder.reset();
      transportFinder.reset();
    });

    it("city", () => {
      routeFinder.init();

      const c = new Company(1, 0, 0);
      const r = new Residence([c], 12, 15);
      modelListener.fire(EventType.CREATED);

      expect(r.nextFor(c)).toEqual(c);
    });

    it("city, then user", () => {
      transportFinder.init();
      routeFinder.init();

      const c = new Company(1, 9, 12);
      const r = new Residence([c], 0, 0);
      modelListener.fire(EventType.CREATED);

      userResource.start(3, 4);
      userResource.extend(6, 8);
      userResource.end();

      const dept1 = userResource.getPrimaryLine().top;
      const p1 = dept1.departure().platform;
      const g1 = p1.station.gate;
      const dept2 = dept1.next.next;
      const p2 = dept2.departure().platform;
      const g2 = p2.station.gate;

      expect(r.nextFor(c)).toEqual(g1);
      expect(g1.nextFor(c)).toEqual(p1);
      expect(p1.nextFor(c)).toEqual(dept1);
      expect(dept1.nextFor(c)).toEqual(p2);
      expect(p2.nextFor(c)).toEqual(g2);
      expect(g2.nextFor(c)).toEqual(c);

      expect(r.paymentFor(c)).toEqual(50);
      expect(g1.paymentFor(c)).toEqual(50);
      expect(p1.paymentFor(c)).toEqual(50);
      expect(dept1.paymentFor(c)).toEqual(50);
      expect(p2.paymentFor(c)).toEqual(0);
      expect(g2.paymentFor(c)).toEqual(0);
    });

    it("user, then city", () => {
      transportFinder.init();
      routeFinder.init();

      userResource.start(3, 4);
      userResource.extend(6, 8);
      userResource.end();

      const c = new Company(1, 9, 12);
      const r = new Residence([c], 0, 0);
      modelListener.fire(EventType.CREATED);

      const dept1 = userResource.getPrimaryLine().top;
      const p1 = dept1.departure().platform;
      const g1 = p1.station.gate;
      const dept2 = dept1.next.next;
      const p2 = dept2.departure().platform;
      const g2 = p2.station.gate;

      expect(r.nextFor(c)).toEqual(g1);
      expect(g1.nextFor(c)).toEqual(p1);
      expect(p1.nextFor(c)).toEqual(dept1);
      expect(dept1.nextFor(c)).toEqual(p2);
      expect(p2.nextFor(c)).toEqual(g2);
      expect(g2.nextFor(c)).toEqual(c);
    });

    it("residence add", () => {
      transportFinder.init();
      routeFinder.init();

      const c = new Company(1, 9, 12);
      const r1 = new Residence([c], 0, 0);
      modelListener.fire(EventType.CREATED);

      userResource.start(3, 4);
      userResource.extend(6, 8);
      userResource.end();

      const r2 = new Residence([c], 0, 0);
      modelListener.fire(EventType.CREATED);

      const dept1 = userResource.getPrimaryLine().top;
      const p1 = dept1.departure().platform;
      const g1 = p1.station.gate;
      const dept2 = dept1.next.next;
      const p2 = dept2.departure().platform;
      const g2 = p2.station.gate;

      expect(r2.nextFor(c)).toEqual(g1);
      expect(g1.nextFor(c)).toEqual(p1);
      expect(p1.nextFor(c)).toEqual(dept1);
      expect(dept1.nextFor(c)).toEqual(p2);
      expect(p2.nextFor(c)).toEqual(g2);
      expect(g2.nextFor(c)).toEqual(c);
    });

    it("human who move to company seeks to gate", () => {
      transportFinder.init();
      routeFinder.init();

      const c = new Company(1, 12, 15);
      const r = new Residence([c], 0, 0);
      modelListener.fire(EventType.CREATED);
      const h = new Human(r, c);
      modelListener.fire(EventType.CREATED);
      expect(h.nextFor(c)).toBeUndefined();

      userResource.start(3, 4);
      userResource.extend(6, 8);
      userResource.end();

      const dept1 = userResource.getPrimaryLine().top;
      const p1 = dept1.departure().platform;
      const g1 = p1.station.gate;
      const dept2 = dept1.next.next;
      const p2 = dept2.departure().platform;
      const g2 = p2.station.gate;

      expect(h.nextFor(c)).toEqual(g1);
      expect(h._getNext()).toEqual(g1);
      const prev = h.loc();
      h._step();
      expect(h._getNext()).toEqual(g1);
      expect(h.loc()).not.toEqual(prev);
    });

    it("reroute after delete", () => {
      transportFinder.init();
      routeFinder.init();

      const c = new Company(1, 12, 15);
      const r = new Residence([c], 0, 0);
      const h = new Human(r, c);
      modelListener.fire(EventType.CREATED);

      userResource.start(3, 4);
      userResource.extend(6, 8);
      userResource.end();

      userResource.rollback();

      expect(r.nextFor(c)).toEqual(c);
      expect(h.nextFor(c)).toEqual(c);

      for (let i = 0; i < FPS * Human.SPEED; i++) h._step();

      expect(h.state()).toEqual(HumanState.ARCHIVED);
      userResource.rollback();
      expect(h.nextFor(c)).toEqual(c);
    });

    it("human reroute", () => {
      transportFinder.init();
      routeFinder.init();

      const c = new Company(1, 30, 40);
      const r = new Residence([c], 0, 0);

      userResource.start(0, 0);
      userResource.extend(30, 40);
      userResource.end();

      const dept1 = userResource.getPrimaryLine().top;
      const p1 = dept1.departure().platform;
      const g1 = p1.station.gate;
      const dept2 = dept1.next.next;
      const p2 = dept2.departure().platform;
      const g2 = p2.station.gate;

      const onGround = new Human(r, c);
      expect(onGround.state()).toEqual(HumanState.SPAWNED);
      expect(onGround._getGate()).toBeUndefined();

      const onGate = new Human(r, c);
      onGate._step();
      for (let i = 0; i < FPS / Gate.MOBILITY_SEC; i++) g1._step();

      expect(onGate.state()).toEqual(HumanState.WAIT_ENTER_PLATFORM);
      expect(onGate._getGate()).toEqual(g1);

      const onPlatform = new Human(r, c);
      onPlatform._step();
      for (let i = 0; i < FPS / Gate.MOBILITY_SEC; i++) g1._step();
      onPlatform._step();

      expect(onPlatform.state()).toEqual(HumanState.WAIT_ENTER_DEPTQUEUE);
      expect(onPlatform._getPlatform()).toEqual(p1);

      const onDept = new Human(r, c);
      onDept._step();
      for (let i = 0; i < FPS / Gate.MOBILITY_SEC; i++) g1._step();
      onDept._step();
      onDept._step();

      expect(onDept.state()).toEqual(HumanState.WAIT_TRAIN_ARRIVAL);
      expect(onDept._getDeptTask()).toEqual(dept1);

      modelListener.fire(EventType.CREATED);
      modelListener.fire(EventType.MODIFIED);
      userResource.commit();
      userResource.rollback(); // fire reroute

      expect(onGround.nextFor(c)).toEqual(g1);
      expect(onGate.nextFor(c)).toEqual(p1);
      expect(onPlatform.nextFor(c)).toEqual(p1);
      expect(onDept.nextFor(c)).toEqual(dept1);

      const t = find(ts, (t) => t.current()._base() == dept1);

      for (let i = 0; i < FPS * Train.STAY_SEC - 1; i++) {
        t._step();
        expect(t.current()._base()).toEqual(dept1);
        expect(t.loc()).toEqual(p1.loc());
      }
      t._step();
      expect(t.current()._base()).toEqual(dept1.next);
      expect(t.loc()).toEqual(p1.loc());
      t._step();
      expect(t.current()._base()).toEqual(dept1.next);
      expect(t.loc()).not.toEqual(p1.loc());
      expect(t.loc()).not.toEqual(p2.loc());
      modelListener.fire(EventType.MODIFIED);
      expect(onDept.state()).toEqual(HumanState.ON_TRAIN);
      expect(onDept._getTrain()).toEqual(t);

      userResource.rollback(); // fire reroute

      expect(onDept.nextFor(c)).toEqual(p2);
    });
  });

  /**
   * rn1 -> rn2 -> rnX -> rn2 -> rn3 とあるとき
   * rn1 -> rn2 -> rn3 となる経路を導き出せるか
   */
  describe("transfer", () => {
    let r: Residence;
    let c: Company;
    let rn1: RailNode;
    let rn2: RailNode;
    let rn3: RailNode;
    let rnX: RailNode;
    let g1: Gate;
    let g2: Gate;
    let g3: Gate;
    let gX: Gate;
    let p1: Platform;
    let p2: Platform;
    let p3: Platform;
    let pX: Platform;
    let dept12: DeptTask;
    let move12: LineTask;
    let dept2X: DeptTask;
    let move2X: LineTask;
    let deptX2: DeptTask;
    let moveX2: LineTask;
    let dept23: DeptTask;
    let move23: LineTask;
    let dept32: DeptTask;
    let move32: LineTask;
    let dept21: DeptTask;
    let move21: LineTask;
    let t: Train;

    beforeEach(() => {
      transportFinder.init();
      routeFinder.init();
      userResource.init();
      const rns: RailNode[] = [];
      const ts: Train[] = [];
      modelListener
        .find(EventType.CREATED, RailNode)
        .register((rn) => rns.push(rn));
      modelListener.find(EventType.CREATED, Train).register((t) => ts.push(t));
      c = new Company(1, 100, 0);
      r = new Residence([c], 0, 0);
      userResource.start(0, 0);
      rn1 = rns[0];
      p1 = rn1.platform;
      g1 = p1.station.gate;
      userResource.extend(50, 0);
      rn2 = rns[1];
      userResource.extend(100, 0);
      userResource.end();
      rn3 = rns[2];
      p3 = rn3.platform;
      g3 = p3.station.gate;
      userResource.station(rn2);
      p2 = rn2.platform;
      userResource.branch(p2);
      userResource.extend(50, -50);
      userResource.end();
      rnX = rns[3];
      pX = rnX.platform;
      gX = pX.station.gate;
      dept12 = userResource.getPrimaryLine().top;
      move12 = dept12.next;
      dept2X = move12.next as DeptTask;
      move2X = dept2X.next;
      deptX2 = move2X.next as DeptTask;
      moveX2 = deptX2.next;
      dept23 = moveX2.next as DeptTask;
      move23 = dept23.next;
      dept32 = move23.next as DeptTask;
      move32 = dept32.next;
      dept21 = move32.next as DeptTask;
      move21 = dept21.next;
      t = find(ts, (t) => t.current()._base() === dept12);
    });

    afterEach(() => {
      modelListener.flush();
      modelListener.unregisterAll();
      userResource.reset();
      routeFinder.reset();
      transportFinder.reset();
    });

    it("model check", () => {
      expect(rn1.loc().x).toEqual(0);
      expect(rn1.loc().y).toEqual(0);
      expect(rn2.loc().x).toEqual(50);
      expect(rn2.loc().y).toEqual(0);
      expect(rn3.loc().x).toEqual(100);
      expect(rn3.loc().y).toEqual(0);
      expect(rnX.loc().x).toEqual(50);
      expect(rnX.loc().y).toEqual(-50);
      expect(p1.on).toEqual(rn1);
      expect(p2.on).toEqual(rn2);
      expect(p3.on).toEqual(rn3);
      expect(pX.on).toEqual(rnX);

      expect(dept12.stay).toEqual(p1);
      expect(move12.departure()).toEqual(rn1);
      expect(move12.destination()).toEqual(rn2);
      expect(dept2X.stay).toEqual(p2);
      expect(move2X.departure()).toEqual(rn2);
      expect(move2X.destination()).toEqual(rnX);
      expect(deptX2.stay).toEqual(pX);
      expect(moveX2.departure()).toEqual(rnX);
      expect(moveX2.destination()).toEqual(rn2);
      expect(dept23.stay).toEqual(p2);
      expect(move23.departure()).toEqual(rn2);
      expect(move23.destination()).toEqual(rn3);
      expect(dept32.stay).toEqual(p3);
      expect(move32.departure()).toEqual(rn3);
      expect(move32.destination()).toEqual(rn2);
      expect(dept21.stay).toEqual(p2);
      expect(move21.departure()).toEqual(rn2);
      expect(move21.destination()).toEqual(rn1);
      expect(move21.next).toEqual(dept12);

      expect(t).not.toBeUndefined();
    });

    it("transfer route", () => {
      expect(r.nextFor(c)).toEqual(g1);
      expect(g1.nextFor(c)).toEqual(p1);
      expect(p1.nextFor(c)).toEqual(dept12);
      expect(dept12.nextFor(c)).toEqual(p2);
      expect(p2.nextFor(c)).toEqual(dept23);
      expect(dept23.nextFor(p3)).toEqual(p3);
      expect(p3.nextFor(c)).toEqual(g3);
      expect(g3.nextFor(c)).toEqual(c);
    });

    it("XXX human transfer train", () => {
      const h = new Human(r, c);
      h._step();
      expect(h.state()).toEqual(HumanState.WAIT_ENTER_GATE);
      expect(h._getNext()).toEqual(g1);
      g1._step();
      expect(h.state()).toEqual(HumanState.WAIT_ENTER_PLATFORM);
      expect(h._getNext()).toEqual(p1);
      h._step();
      expect(h.state()).toEqual(HumanState.WAIT_ENTER_DEPTQUEUE);
      expect(h._getNext()).toEqual(dept12);
      h._step();
      expect(h.state()).toEqual(HumanState.WAIT_TRAIN_ARRIVAL);
      expect(h._getNext()).toEqual(dept12);
      for (let i = 0; i < FPS * Train.STAY_SEC - 1; i++) {
        t._step();
        expect(h.state()).toEqual(HumanState.ON_TRAIN);
        expect(h._getNext()).toEqual(p2);
        expect(t.current()._base()).toEqual(dept12);
      }
      for (let i = 0; i < (FPS * 50) / Train.SPEED; i++) {
        t._step();
        expect(h.state()).toEqual(HumanState.ON_TRAIN);
        expect(h._getNext()).toEqual(p2);
        expect(t.current()._base()).toEqual(move12);
      }
      for (let i = 0; i < FPS * Train.STAY_SEC; i++) {
        t._step();
        expect(h._getPlatform()).toEqual(p2);
        expect(h._getNext()).toEqual(p2);
        expect(h.state()).toEqual(HumanState.WAIT_EXIT_PLATFORM);
        expect(t.current()._base()).toEqual(dept2X);
      }
      h._step();
      expect(h.state()).toEqual(HumanState.WAIT_ENTER_PLATFORM);
      expect(h._getNext()).toEqual(p2);
      h._step();
      expect(h.state()).toEqual(HumanState.WAIT_ENTER_DEPTQUEUE);
      expect(h._getNext()).toEqual(dept23);
      h._step();
      expect(h.state()).toEqual(HumanState.WAIT_TRAIN_ARRIVAL);
      expect(h._getNext()).toEqual(dept23);
    });
  });
});
