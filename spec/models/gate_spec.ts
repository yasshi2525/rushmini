import Station from "models/station";
import Gate from "models/gate";

describe("gate", () => {
  it("initial create", () => {
    const st = new Station();
    const g = new Gate(st);
    expect(g.st).toEqual(st);
    expect(g.capacity).toEqual(1);
  });
});
