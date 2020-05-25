import DeptTask from "models/dept_task";
import Gate from "models/gate";
import Human from "models/human";
import LineTask from "models/line_task";
import modelListener, { EventType } from "models/listener";
import Platform from "models/platform";
import Point from "models/point";
import { Pointable } from "models/pointable";
import RailNode from "models/rail_node";
import { Routable } from "models/routable";
import Train from "models/train";
import userResource, { UserResource } from "models/user_resource";
import { find } from "utils/common";
import ticker from "utils/ticker";
import transportFinder from "utils/transport_finder";

const FPS = 15;
const oldDIST = UserResource.DIST;

beforeAll(() => {
  ticker.init(FPS);
  UserResource.DIST = 1;
});

afterAll(() => {
  UserResource.DIST = oldDIST;
});

describe("transport_finder", () => {
  describe("no transfer", () => {
    beforeEach(() => {
      userResource.init();
    });
    afterEach(() => {
      userResource.reset();
      modelListener.flush();
      modelListener.unregisterAll();
      transportFinder.reset();
    });

    it("init", () => {
      transportFinder.init();

      userResource.start(0, 0);
      userResource.extend(3, 4);
      userResource.end();

      const dept1 = userResource.getPrimaryLine().top;
      const p1 = dept1.departure().platform;
      const dept2 = dept1.next.next as DeptTask;
      const p2 = dept2.departure().platform;

      const cost = (5 / Math.sqrt(10)) * 4;

      expect(p1.nextFor(p2)).toEqual(dept1);
      expect(p1.distanceFor(p2)).toEqual(1.5);
      expect(p1.paymentFor(p2)).toBeCloseTo(cost);
      expect(p1.nextFor(p1)).toEqual(dept1);
      expect(p1.distanceFor(p1)).toEqual(0);
      expect(p1.paymentFor(p1)).toEqual(0);

      expect(dept1.nextFor(p1)).toEqual(p1);
      expect(dept1.distanceFor(p1)).toEqual(0);
      expect(dept1.paymentFor(p1)).toEqual(0);
      expect(dept1.nextFor(p2)).toEqual(p2);
      expect(dept1.distanceFor(p2)).toEqual(1.5); // 乗車 +1
      expect(dept1.paymentFor(p2)).toBeCloseTo(cost);

      expect(p2.nextFor(p1)).toEqual(dept2);
      expect(p2.distanceFor(p1)).toEqual(1.5); // 乗車 +1
      expect(p2.paymentFor(p1)).toBeCloseTo(cost);
      expect(p2.nextFor(p2)).toEqual(dept2);
      expect(p2.distanceFor(p2)).toEqual(0);
      expect(p2.paymentFor(p2)).toEqual(0);

      expect(dept2.nextFor(p1)).toEqual(p1);
      expect(dept2.distanceFor(p1)).toEqual(1.5); // 乗車 +1
      expect(dept2.paymentFor(p1)).toBeCloseTo(cost);
      expect(dept2.nextFor(p2)).toEqual(p2);
      expect(dept2.distanceFor(p2)).toEqual(0);
      expect(dept2.paymentFor(p2)).toEqual(0);
    });

    it("train", () => {
      const ts: Train[] = [];
      modelListener.find(EventType.CREATED, Train).register((t) => ts.push(t));
      transportFinder.init();

      userResource.start(0, 0);
      userResource.extend(3, 4);
      userResource.end();
      userResource.commit();

      const dept1 = userResource.getPrimaryLine().top;
      const p1 = dept1.departure().platform;
      const dept2 = dept1.next.next as DeptTask;
      const p2 = dept2.departure().platform;

      const t = find(
        ts,
        (t) => t.current()._base() === userResource.getPrimaryLine().top
      );

      const cost = (5 / Math.sqrt(10)) * 4;

      expect(t.nextFor(p1)).toEqual(p1);
      expect(t.nextFor(p2)).toEqual(p2);
      expect(t.distanceFor(p1)).toEqual(0);
      expect(t.distanceFor(p2)).toEqual(0.5);
      expect(t.paymentFor(p1)).toEqual(0);
      expect(t.paymentFor(p2)).toBeCloseTo(cost);

      for (let i = 0; i < FPS * Train.STAY_SEC; i++) t._step();
      expect(t.current()._base()).toEqual(dept1.next);

      userResource.rollback(); // fire FIXED

      expect(t.nextFor(p1)).toEqual(p1);
      expect(t.nextFor(p2)).toEqual(p2);
      expect(t.distanceFor(p1)).toEqual(1);
      expect(t.distanceFor(p2)).toEqual(0.5);
      expect(t.paymentFor(p1)).toBeCloseTo(cost * 2);
      expect(t.paymentFor(p2)).toBeCloseTo(cost);
    });

    it("reset", () => {
      transportFinder.init();

      userResource.start(0, 0);
      userResource.extend(3, 4);
      userResource.end();
      userResource.reset();
    });
  });

  /**
   * rn1 -> rn2 -> rnX -> rn2 -> rn3 とあるとき
   * rn1 -> rn2 -> rn3 となる経路を導き出せるか
   */
  describe("transfer", () => {
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
      userResource.init();
      const rns: RailNode[] = [];
      const ts: Train[] = [];
      modelListener
        .find(EventType.CREATED, RailNode)
        .register((rn) => rns.push(rn));
      modelListener.find(EventType.CREATED, Train).register((t) => ts.push(t));

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

      t = find(
        ts,
        (t) => t.current()._base() === userResource.getPrimaryLine().top
      );
    });

    afterEach(() => {
      modelListener.flush();
      modelListener.unregisterAll();
      userResource.reset();
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
    });

    it("transfer by p2", () => {
      expect(dept12.nextFor(p1)).toEqual(p1);
      expect(dept12.nextFor(p2)).toEqual(p2);
      expect(dept12.nextFor(p3)).toEqual(p2);
      expect(dept12.nextFor(pX)).toEqual(pX);
      expect(dept12.distanceFor(p1)).toEqual(0);
      expect(dept12.distanceFor(p2)).toEqual(6); // 乗車
      expect(dept12.distanceFor(p3)).toEqual(12); // 乗車+乗り換え
      expect(dept12.distanceFor(pX)).toEqual(11); // 乗車

      expect(dept2X.nextFor(p1)).toEqual(p2);
      expect(dept2X.nextFor(p2)).toEqual(p2);
      expect(dept2X.nextFor(p3)).toEqual(p2);
      expect(dept2X.nextFor(pX)).toEqual(pX);
      expect(dept2X.distanceFor(p1)).toEqual(6); // 乗車
      expect(dept2X.distanceFor(p2)).toEqual(0);
      expect(dept2X.distanceFor(p3)).toEqual(6); // 乗車
      expect(dept2X.distanceFor(pX)).toEqual(6); // 乗車

      expect(deptX2.nextFor(p1)).toEqual(p2);
      expect(deptX2.nextFor(p2)).toEqual(p2);
      expect(deptX2.nextFor(p3)).toEqual(p3);
      expect(deptX2.nextFor(pX)).toEqual(pX);
      expect(deptX2.distanceFor(p1)).toEqual(12); // 乗車+乗り換え
      expect(deptX2.distanceFor(p2)).toEqual(6); // 乗車
      expect(deptX2.distanceFor(p3)).toEqual(11); // 乗車
      expect(deptX2.distanceFor(pX)).toEqual(0);

      expect(dept23.nextFor(p1)).toEqual(p2);
      expect(dept23.nextFor(p2)).toEqual(p2);
      expect(dept23.nextFor(p3)).toEqual(p3);
      expect(dept23.nextFor(pX)).toEqual(p2);
      expect(dept23.distanceFor(p1)).toEqual(6); // 乗車
      expect(dept23.distanceFor(p2)).toEqual(0);
      expect(dept23.distanceFor(p3)).toEqual(6); // 乗車
      expect(dept23.distanceFor(pX)).toEqual(6); // 乗車

      expect(dept32.nextFor(p1)).toEqual(p1);
      expect(dept32.nextFor(p2)).toEqual(p2);
      expect(dept32.nextFor(p3)).toEqual(p3);
      expect(dept32.nextFor(pX)).toEqual(p2);
      expect(dept32.distanceFor(p1)).toEqual(11); // 乗車
      expect(dept32.distanceFor(p2)).toEqual(6); // 乗車
      expect(dept32.distanceFor(p3)).toEqual(0);
      expect(dept32.distanceFor(pX)).toEqual(12); // 乗車+乗り換え

      expect(dept21.nextFor(p1)).toEqual(p1);
      expect(dept21.nextFor(p2)).toEqual(p2);
      expect(dept21.nextFor(p3)).toEqual(p2);
      expect(dept21.nextFor(pX)).toEqual(p2);
      expect(dept21.distanceFor(p1)).toEqual(6); // 乗車
      expect(dept21.distanceFor(p2)).toEqual(0);
      expect(dept21.distanceFor(p3)).toEqual(6); // 乗車
      expect(dept21.distanceFor(pX)).toEqual(6); // 乗車
    });
    it("train", () => {
      expect(t.nextFor(p1)).toEqual(p1);
      expect(t.nextFor(p2)).toEqual(p2);
      expect(t.nextFor(p3)).toEqual(p2);
      expect(t.nextFor(pX)).toEqual(pX);
      expect(t.distanceFor(p1)).toEqual(0);
      expect(t.distanceFor(p2)).toEqual(5);
      expect(t.distanceFor(p3)).toEqual(11); // 乗り換え必要のため +1
      expect(t.distanceFor(pX)).toEqual(10);
    });
  });
});
