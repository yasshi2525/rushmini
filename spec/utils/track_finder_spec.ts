import trackFinder from "utils/track_finder";
import modelListener, { EventType } from "models/listener";
import Company from "models/company";
import Residence from "models/residence";
import RailLine from "models/rail_line";
import userResource, { UserResource } from "models/user_resource";
import RailNode from "models/rail_node";

describe("track_finder", () => {
  afterEach(() => {
    modelListener.unregisterAll();
    userResource.reset();
    trackFinder.reset();
  });

  it("init", () => {
    trackFinder.init();

    userResource.start(0, 0);
    userResource.extend(3, 4);
    userResource.extend(6, 8);
    userResource.end();

    const dept = userResource.getPrimaryLine().top;
    const rn1 = dept.departure();
    const rn2 = dept.next.desttination();
    const rn3 = dept.next.next.desttination();

    expect(rn1.nextFor(rn1)).toEqual(rn2);
    expect(rn1.costFor(rn1)).toEqual(1);
    expect(rn1.nextFor(rn2)).toEqual(rn2);
    expect(rn1.costFor(rn2)).toEqual(0.5);
    expect(rn1.nextFor(rn3)).toEqual(rn2);
    expect(rn1.costFor(rn3)).toEqual(1);

    expect(rn2.nextFor(rn1)).toEqual(rn1);
    expect(rn2.costFor(rn1)).toEqual(0.5);
    expect(rn2.nextFor(rn2)).toEqual(rn1);
    expect(rn2.costFor(rn2)).toEqual(1);
    expect(rn2.nextFor(rn3)).toEqual(rn3);
    expect(rn2.costFor(rn3)).toEqual(0.5);
  });
});
