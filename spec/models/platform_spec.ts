import Station from "models/station";
import RailNode from "models/rail_node";
import Platform from "models/platform";
import modelListener from "models/listener";

afterAll(() => {
  modelListener.flush();
});

describe("platform", () => {
  it("register reference on creation", () => {
    const st = new Station();
    const on = new RailNode(0, 0);
    const p = new Platform(on, st);

    expect(p.on).toEqual(on);
    expect(on.platform).toEqual(p);
    expect(p.station).toEqual(st);
    expect(st.platforms).toContain(p);
  });
});
