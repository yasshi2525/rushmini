import modelListener from "models/listener";
import Platform from "models/platform";
import RailNode from "models/rail_node";
import Station from "models/station";

afterAll(() => {
  modelListener.flush();
});

describe("station", () => {
  describe("loc", () => {
    it("ok", () => {
      const rn1 = new RailNode(0, 0);
      const rn2 = new RailNode(2, 4);
      const st = new Station();
      const _1 = new Platform(rn1, st);
      const _2 = new Platform(rn2, st);
      expect(st.loc().x).toEqual(1);
      expect(st.loc().y).toEqual(2);
    });
  });
});
