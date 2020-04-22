import Company from "models/company";
import Residence from "models/residence";
import modelListener from "models/listener";
import Human from "models/human";

const oldFPS = Residence.FPS;

const FPS = 60;

afterAll(() => {
  modelListener.flush();
  Residence.FPS = oldFPS;
});

describe("residence", () => {
  let hs: Human[];
  beforeEach(() => {
    Residence.FPS = FPS;
    hs = [];
    modelListener.human.register({
      onDone: (h) => hs.push(h),
      onDelete: () => {},
    });
  });

  afterEach(() => {
    modelListener.flush();
    modelListener.human._unregisterAll();
  });

  it("initialize", () => {
    const r = new Residence([], FPS, 1, 2);
    expect(r.x).toEqual(1);
    expect(r.y).toEqual(2);
  });

  it("forbit to spawn quickly", () => {
    const r = new Residence([new Company(1, 0, 0)], 0, 1, 2);
    r._step(1);
    modelListener.done();
    expect(hs.length).toEqual(1);
  });

  describe("_spawn", () => {
    let hs: Human[];
    let intervalSec: number;

    beforeEach(() => {
      hs = [];
      intervalSec = 1;
      modelListener.human.register({
        onDone: (h) => hs.push(h),
        onDelete: () => {},
      });
    });

    afterEach(() => {
      modelListener.flush();
      modelListener.human._unregisterAll();
    });

    it("spawn single human destinating single target", () => {
      const c = new Company(1, 0, 0);
      const r = new Residence([c], intervalSec, 0, 0);
      r._step(Residence.FPS);
      modelListener.done();
      const h = hs[0];
      expect(h.departure).toEqual(r);
      expect(h.destination).toEqual(c);
    });

    it("spawn human iteratably", () => {
      const c = new Company(1, 0, 0);
      const r = new Residence([c], intervalSec, 0, 0);
      for (var i = 0; i < 5; i++) {
        r._step(Residence.FPS);
        modelListener.done();
        const h = hs[0];
        expect(h.departure).toEqual(r);
        expect(h.destination).toEqual(c);
      }
    });

    it("spawn human, swithing destination", () => {
      const c1 = new Company(1, 0, 0);
      const c2 = new Company(1, 0, 0);
      const r = new Residence([c1, c2], intervalSec, 0, 0);

      r._step(Residence.FPS);
      modelListener.done();
      const h1 = hs[0];
      expect(h1.departure).toEqual(r);
      expect(h1.destination).toEqual(c1);

      r._step(Residence.FPS);
      modelListener.done();
      const h2 = hs[1];
      expect(h2.departure).toEqual(r);
      expect(h2.destination).toEqual(c2);

      r._step(Residence.FPS);
      modelListener.done();
      const h3 = hs[2];
      expect(h3.departure).toEqual(r);
      expect(h3.destination).toEqual(c1);

      r._step(Residence.FPS);
      modelListener.done();
      const h4 = hs[3];
      expect(h4.departure).toEqual(r);
      expect(h4.destination).toEqual(c2);
    });

    it("spawn human reflected company attractiveness", () => {
      const c1 = new Company(1, 0, 0);
      const c2 = new Company(2, 0, 0);
      const c3 = new Company(3, 0, 0);
      const r = new Residence([c1, c2, c3], intervalSec, 0, 0);

      const destList = [c1, c2, c2, c3, c3, c3];
      destList.forEach((dst) => {
        r._step(Residence.FPS);
        modelListener.done();
        const h = hs.shift();
        expect(h.departure).toEqual(r);
        expect(h.destination).toEqual(dst);
      });
    });

    it("forbit to spawn human when no company registered", () => {
      const r = new Residence([], intervalSec, 0, 0);
      r._step(Residence.FPS);
      modelListener.done();
      expect(hs.length).toEqual(0);
    });
  });
});
