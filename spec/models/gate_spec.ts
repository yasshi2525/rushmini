import Station from "models/station";
import Gate from "models/gate";
import modelListener from "models/listener";

afterAll(() => {
  modelListener.flush();
});

describe("gate", () => {
  it("initial create", () => {
    const st = new Station();
    const g = new Gate(st);
    expect(g.st).toEqual(st);
    expect(g.capacity).toEqual(1);
  });
});
