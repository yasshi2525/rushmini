import Company from "models/company";
import Gate from "models/gate";
import Human, { HumanState } from "models/human";
import modelListener, { EventType } from "models/listener";
import Residence from "models/residence";
import Train from "models/train";
import userResource from "models/user_resource";
import routeFinder from "utils/route_finder";
import ticker from "utils/ticker";
import transportFinder from "utils/transport_finder";
import { find } from "utils/common";
import DeptTask from "models/dept_task";

const FPS = 15;

beforeAll(() => {
  ticker.init(FPS);
});

describe("route_finder", () => {
  let ts: Train[];

  beforeEach(() => {
    ts = [];
    modelListener.find(EventType.CREATED, Train).register((t) => ts.push(t));
  });

  afterEach(() => {
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
    userResource.reset();

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

    expect(r.paymentFor(c)).toEqual(0.5);
    expect(g1.paymentFor(c)).toEqual(0.5);
    expect(p1.paymentFor(c)).toEqual(0.5);
    expect(dept1.paymentFor(c)).toEqual(0.5);
    expect(p2.paymentFor(c)).toEqual(0);
    expect(g2.paymentFor(c)).toEqual(0);
  });

  it("user, then city", () => {
    transportFinder.init();
    routeFinder.init();
    userResource.reset();

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
    userResource.reset();

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
    userResource.reset();

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
    userResource.reset();

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
    userResource.reset();

    const c = new Company(1, 3, 4);
    const r = new Residence([c], 0, 0);

    userResource.start(0, 0);
    userResource.extend(3, 4);
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
      expect(t.loc()).toEqual(p1.loc());
    }
    t._step();
    expect(t.current()._base()).not.toBeInstanceOf(DeptTask);
    expect(t.loc()).not.toEqual(p1.loc());
    expect(t.loc()).not.toEqual(p2.loc());
    modelListener.fire(EventType.MODIFIED);
    expect(onDept.state()).toEqual(HumanState.ON_TRAIN);
    expect(onDept._getTrain()).toEqual(t);

    userResource.rollback(); // fire reroute

    expect(onDept.nextFor(c)).toEqual(p2);
  });
});
