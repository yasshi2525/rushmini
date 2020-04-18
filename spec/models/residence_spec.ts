import Company from "models/company";
import Residence from "models/residence";

describe("residence", () => {
  it("initialize", () => {
    const r = new Residence([], 1, 2);
    expect(r.x).toEqual(1);
    expect(r.y).toEqual(2);
  });

  describe("_spawn", () => {
    it("spawn single human destinating single target", () => {
      const c = new Company(1, 0, 0);
      const r = new Residence([c], 0, 0);
      const h = r._spawn();
      expect(h.departure).toEqual(r);
      expect(h.destination).toEqual(c);
    });

    it("spawn human iteratably", () => {
      const c = new Company(1, 0, 0);
      const r = new Residence([c], 0, 0);
      for (var i = 0; i < 5; i++) {
        const h = r._spawn();
        expect(h.departure).toEqual(r);
        expect(h.destination).toEqual(c);
      }
    });

    it("spawn human, swithing destination", () => {
      const c1 = new Company(1, 0, 0);
      const c2 = new Company(1, 0, 0);
      const r = new Residence([c1, c2], 0, 0);

      const h1 = r._spawn();
      expect(h1.departure).toEqual(r);
      expect(h1.destination).toEqual(c1);

      const h2 = r._spawn();
      expect(h2.departure).toEqual(r);
      expect(h2.destination).toEqual(c2);

      const h3 = r._spawn();
      expect(h3.departure).toEqual(r);
      expect(h3.destination).toEqual(c1);

      const h4 = r._spawn();
      expect(h4.departure).toEqual(r);
      expect(h4.destination).toEqual(c2);
    });

    it("spawn human reflected company attractiveness", () => {
      const c1 = new Company(1, 0, 0);
      const c2 = new Company(2, 0, 0);
      const c3 = new Company(3, 0, 0);
      const r = new Residence([c1, c2, c3], 0, 0);

      const destList = [c1, c2, c2, c3, c3, c3];
      destList.forEach((dst) => {
        const h = r._spawn();
        expect(h.departure).toEqual(r);
        expect(h.destination).toEqual(dst);
      });
    });

    it("forbit to spawn human when no company registered", () => {
      const r = new Residence([], 0, 0);
      const h = r._spawn();
      expect(h).toBeUndefined();
    });
  });
});
