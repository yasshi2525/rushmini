import modelListener from "models/listener";
import userResource from "models/user_resource";
import transportFinder from "utils/transport_finder";

describe("transport_finder", () => {
  afterEach(() => {
    userResource.reset();
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
    const dept2 = dept1.next.next;
    const p2 = dept2.departure().platform;

    expect(p1.nextFor(p2)).toEqual(p2);
    expect(p1.costFor(p2)).toEqual(0.5);
    expect(p1.nextFor(p1)).toEqual(p2);
    expect(p1.costFor(p1)).toEqual(1);

    expect(p2.nextFor(p1)).toEqual(p1);
    expect(p2.costFor(p1)).toEqual(0.5);
    expect(p2.nextFor(p2)).toEqual(p1);
    expect(p2.costFor(p2)).toEqual(1);
  });
});
