import Company from "models/company";
import Human from "models/human";
import modelListener, { EventType } from "models/listener";
import Residence from "models/residence";
import userResource from "models/user_resource";
import routeFinder from "utils/route_finder";
import transportFinder from "utils/transport_finder";

describe("route_finder", () => {
  afterEach(() => {
    userResource.reset();
    modelListener.unregisterAll();
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

    expect(r.nextFor(c)).toEqual(g1);
    expect(h.nextFor(c)).toEqual(g1);
  });
});
