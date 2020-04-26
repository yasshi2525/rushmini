import RailNode from "models/rail_node";
import Station from "models/station";
import Platform from "models/platform";
import modelListener from "models/listener";

afterAll(() => {
  modelListener.flush();
});

describe("station", () => {
  describe("loc", () => {
    it("ok", () => {
      const rn1 = new RailNode(0, 0);
      const rn2 = new RailNode(2, 4);
      const st = new Station();
      new Platform(rn1, st);
      new Platform(rn2, st);
      expect(st.loc().x).toEqual(1);
      expect(st.loc().y).toEqual(2);
    });
  });
});
