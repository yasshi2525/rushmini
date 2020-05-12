import modelListener from "models/listener";
import userResource from "models/user_resource";
import trackFinder from "utils/track_finder";

describe("track_finder", () => {
  beforeEach(() => {
    userResource.init();
  });
  afterEach(() => {
    modelListener.unregisterAll();
    userResource.reset();
    trackFinder.reset();
  });

  it("init", () => {
    trackFinder.init();

    userResource.start(0, 0);
    userResource.extend(30, 40);
    userResource.extend(60, 80);
    userResource.end();

    const dept = userResource.getPrimaryLine().top;
    const rn1 = dept.departure();
    const rn2 = dept.next.destination();
    const rn3 = dept.next.next.destination();

    expect(rn1.nextFor(rn1)).toEqual(rn2);
    expect(rn1.distanceFor(rn1)).toEqual(10);
    expect(rn1.nextFor(rn2)).toEqual(rn2);
    expect(rn1.distanceFor(rn2)).toEqual(5);
    expect(rn1.nextFor(rn3)).toEqual(rn2);
    expect(rn1.distanceFor(rn3)).toEqual(10);

    expect(rn2.nextFor(rn1)).toEqual(rn1);
    expect(rn2.distanceFor(rn1)).toEqual(5);
    expect(rn2.nextFor(rn2)).toEqual(rn1);
    expect(rn2.distanceFor(rn2)).toEqual(10);
    expect(rn2.nextFor(rn3)).toEqual(rn3);
    expect(rn2.distanceFor(rn3)).toEqual(5);
  });

  it("remove", () => {
    trackFinder.init();

    userResource.start(0, 0);
    userResource.extend(30, 40);
    userResource.end();
    userResource.commit();
    userResource.branch(userResource.getPrimaryLine().top.stay);
    userResource.extend(60, 80);
    userResource.end();
    userResource.rollback();
  });
});
