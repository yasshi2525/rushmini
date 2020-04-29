import DeptTask from "models/dept_task";
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
    const dept2 = dept1.next.next as DeptTask;
    const p2 = dept2.departure().platform;

    expect(p1.nextFor(p2)).toEqual(dept1);
    expect(p1.costFor(p2)).toEqual(0.5);
    expect(p1.nextFor(p1)).toEqual(dept1);
    expect(p1.costFor(p1)).toEqual(1);

    expect(dept1.nextFor(p1)).toEqual(p2);
    expect(dept1.costFor(p1)).toEqual(1);
    expect(dept1.nextFor(p2)).toEqual(p2);
    expect(dept1.costFor(p2)).toEqual(0.5);

    expect(p2.nextFor(p1)).toEqual(dept2);
    expect(p2.costFor(p1)).toEqual(0.5);
    expect(p2.nextFor(p2)).toEqual(dept2);
    expect(p2.costFor(p2)).toEqual(1);

    expect(dept2.nextFor(p1)).toEqual(p1);
    expect(dept2.costFor(p1)).toEqual(0.5);
    expect(dept2.nextFor(p2)).toEqual(p1);
    expect(dept2.costFor(p2)).toEqual(1);
  });
});
