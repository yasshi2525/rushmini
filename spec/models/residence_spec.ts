import Company from "models/company";
import Residence from "models/residence";
import modelListener, { EventType } from "models/listener";
import Human from "models/human";

const oldFPS = Residence.FPS;
const oldINTERVAL_SEC = Residence.INTERVAL_SEC;

const FPS = 60;

afterAll(() => {
  modelListener.flush();
  Residence.FPS = oldFPS;
});

describe("residence", () => {
  let hs: Human[];
  let cb: (h: Human) => void;
  beforeEach(() => {
    Residence.FPS = FPS;
    hs = [];
    cb = (h) => hs.push(h);
  });

  it("initialize", () => {
    const r = new Residence([], 1, 2, cb);
    expect(r.loc().x).toEqual(1);
    expect(r.loc().y).toEqual(2);
  });

  describe("_spawn", () => {
    let newHumans: Human[];
    let cbNew: (h: Human) => void;

    beforeEach(() => {
      newHumans = [];
      cbNew = (h) => newHumans.push(h);
      Residence.INTERVAL_SEC = 1;
    });

    afterEach(() => {
      Residence.INTERVAL_SEC = oldINTERVAL_SEC;
    });

    it("spawn single human destinating single target", () => {
      const c = new Company(1, 0, 0);
      const r = new Residence([c], 0, 0, cbNew);
      r._step(Residence.FPS);
      const h = newHumans[0];
      expect(h.departure).toEqual(r);
      expect(h.destination).toEqual(c);
    });

    it("spawn human iteratably", () => {
      const c = new Company(1, 0, 0);
      const r = new Residence([c], 0, 0, cbNew);
      for (var i = 0; i < 5; i++) {
        r._step(Residence.FPS);
        const h = newHumans[0];
        expect(h.departure).toEqual(r);
        expect(h.destination).toEqual(c);
      }
    });

    it("spawn human, swithing destination", () => {
      const c1 = new Company(1, 0, 0);
      const c2 = new Company(1, 0, 0);
      const r = new Residence([c1, c2], 0, 0, cbNew);

      r._step(Residence.FPS);
      const h1 = newHumans[0];
      expect(h1.departure).toEqual(r);
      expect(h1.destination).toEqual(c1);

      r._step(Residence.FPS);
      const h2 = newHumans[1];
      expect(h2.departure).toEqual(r);
      expect(h2.destination).toEqual(c2);

      r._step(Residence.FPS);
      const h3 = newHumans[2];
      expect(h3.departure).toEqual(r);
      expect(h3.destination).toEqual(c1);

      r._step(Residence.FPS);
      const h4 = newHumans[3];
      expect(h4.departure).toEqual(r);
      expect(h4.destination).toEqual(c2);
    });

    it("spawn human reflected company attractiveness", () => {
      const c1 = new Company(1, 0, 0);
      const c2 = new Company(2, 0, 0);
      const c3 = new Company(3, 0, 0);
      const r = new Residence([c1, c2, c3], 0, 0, cbNew);

      const destList = [c1, c2, c2, c3, c3, c3];
      destList.forEach((dst) => {
        r._step(Residence.FPS);
        const h = newHumans.shift();
        expect(h.departure).toEqual(r);
        expect(h.destination).toEqual(dst);
      });
    });

    it("forbit to spawn human when no company registered", () => {
      const r = new Residence([], 0, 0, cbNew);
      r._step(Residence.FPS);
      expect(newHumans.length).toEqual(0);
    });
  });
});
