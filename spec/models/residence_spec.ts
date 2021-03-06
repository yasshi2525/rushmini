import Company from "models/company";
import Human from "models/human";
import modelListener, { EventType } from "models/listener";
import { distance } from "models/pointable";
import Residence from "models/residence";
import random from "utils/random";
import ticker from "utils/ticker";

let oldWarn: (msg: string) => void;
const oldINTERVAL_SEC = Residence.INTERVAL_SEC;

const FPS = 60;

beforeAll(() => {
  oldWarn = console.warn;
  random.init(new g.XorshiftRandomGenerator(0));
  ticker.init(FPS);
});

afterAll(() => {
  modelListener.flush();
  ticker.reset();
  Residence.INTERVAL_SEC = oldINTERVAL_SEC;
});

describe("residence", () => {
  beforeEach(() => {
    ticker.init(FPS);
  });

  afterEach(() => {
    console.warn = oldWarn;
  });

  it("initialize", () => {
    const r = new Residence([], 1, 2, (min, max) =>
      random.random().get(min, max)
    );
    expect(r.loc().x).toEqual(1);
    expect(r.loc().y).toEqual(2);
  });

  it("_fire", () => {
    console.warn = jest.fn();
    const c = new Company(1, 1, 2);
    const r = new Residence([c], 3, 4, (min, max) =>
      random.random().get(min, max)
    );
    r._fire(undefined);
    expect(console.warn).toHaveBeenCalled();
  });

  it("_giveup", () => {
    console.warn = jest.fn();
    const c = new Company(1, 1, 2);
    const r = new Residence([c], 3, 4, (min, max) =>
      random.random().get(min, max)
    );
    r._giveup(undefined);
    expect(console.warn).toHaveBeenCalled();
  });

  describe("_spawn", () => {
    let modifiedHuman: Human[];
    let newHumans: Human[];

    beforeEach(() => {
      newHumans = [];
      modifiedHuman = [];
      modelListener
        .find(EventType.CREATED, Human)
        .register((h) => newHumans.push(h));
      modelListener
        .find(EventType.MODIFIED, Human)
        .register((h) => modifiedHuman.push(h));
      Residence.INTERVAL_SEC = 1;
    });

    afterEach(() => {
      console.warn = oldWarn;
      modelListener.flush();
      modelListener.unregisterAll();
    });

    it("spawn single human destinating single target", () => {
      const c = new Company(1, 0, 0);
      const r = new Residence([c], 0, 0, (min, max) =>
        random.random().get(min, max)
      );
      r._setNext(c, c, distance(c, r));
      for (let j = 0; j < FPS; j++) r._step();
      modelListener.fire(EventType.CREATED);
      const h = newHumans[0];
      expect(h.departure).toEqual(r);
      expect(h.destination).toEqual(c);
    });

    it("spawn human iteratably", () => {
      const c = new Company(1, 0, 0);
      const r = new Residence([c], 0, 0, (min, max) =>
        random.random().get(min, max)
      );
      r._setNext(c, c, distance(c, r));
      for (let i = 0; i < 5; i++) {
        for (let j = 0; j < FPS; j++) r._step();
        modelListener.fire(EventType.CREATED);
        const h = newHumans.shift();
        expect(h.departure).toEqual(r);
        expect(h.destination).toEqual(c);
      }
    });

    it("spawn human, swithing destination", () => {
      const c1 = new Company(1, 0, 0);
      const c2 = new Company(1, 0, 0);
      const r = new Residence([c1, c2], 0, 0, (min, max) =>
        random.random().get(min, max)
      );
      r._setNext(c1, c1, distance(c1, r));
      r._setNext(c2, c2, distance(c2, r));

      for (let j = 0; j < FPS; j++) r._step();
      modelListener.fire(EventType.CREATED);
      const h1 = newHumans[0];
      expect(h1.departure).toEqual(r);
      expect(h1.destination).toEqual(c1);

      for (let j = 0; j < FPS; j++) r._step();
      modelListener.fire(EventType.CREATED);
      const h2 = newHumans[1];
      expect(h2.departure).toEqual(r);
      expect(h2.destination).toEqual(c2);

      for (let j = 0; j < FPS; j++) r._step();
      modelListener.fire(EventType.CREATED);
      const h3 = newHumans[2];
      expect(h3.departure).toEqual(r);
      expect(h3.destination).toEqual(c1);

      for (let j = 0; j < FPS; j++) r._step();
      modelListener.fire(EventType.CREATED);
      const h4 = newHumans[3];
      expect(h4.departure).toEqual(r);
      expect(h4.destination).toEqual(c2);
    });

    it("spawn human reflected company attractiveness", () => {
      const c1 = new Company(1, 0, 0);
      const c2 = new Company(2, 0, 0);
      const c3 = new Company(3, 0, 0);
      const r = new Residence([c1, c2, c3], 0, 0, (min, max) =>
        random.random().get(min, max)
      );
      r._setNext(c1, c1, distance(c1, r));
      r._setNext(c2, c2, distance(c2, r));
      r._setNext(c3, c3, distance(c3, r));

      const destList = [c1, c2, c2, c3, c3, c3];
      destList.forEach((dst) => {
        for (let j = 0; j < FPS; j++) r._step();
        modelListener.fire(EventType.CREATED);
        const h = newHumans.shift();
        expect(h.departure).toEqual(r);
        expect(h.destination).toEqual(dst);
      });
    });

    it("forbit to spawn human when no company registered", () => {
      console.warn = jest.fn();
      const r = new Residence([], 0, 0, (min, max) =>
        random.random().get(min, max)
      );
      for (let j = 0; j < FPS; j++) r._step();
      modelListener.fire(EventType.CREATED);
      expect(newHumans.length).toEqual(0);
      expect(console.warn).toHaveBeenCalled();
    });
  });
});
