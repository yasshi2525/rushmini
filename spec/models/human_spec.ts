import Company from "models/company";
import Human, { HumanState } from "models/human";
import modelListener from "models/listener";
import { distance } from "models/pointable";
import Residence from "models/residence";
import ticker from "utils/ticker";

const oldSpeed = Human.SPEED;

const FPS = 30;
const defaultSpeed = 20;

beforeAll(() => {
  ticker.init(FPS);
});

afterAll(() => {
  modelListener.flush();
  ticker.reset();
  Human.SPEED = defaultSpeed;
});

describe("human", () => {
  it("initialize", () => {
    const c = new Company(1, 1, 2);
    const r = new Residence([c], 3, 4);
    const h = new Human(r, c);
    expect(h.loc().x).toEqual(3);
    expect(h.loc().y).toEqual(4);
  });

  it("_fire", () => {
    const c = new Company(1, 1, 2);
    const r = new Residence([c], 3, 4);
    const h = new Human(r, c);
    h._fire();
    expect(h.state()).toEqual(HumanState.SPAWNED);
  });

  describe("_step", () => {
    beforeEach(() => {
      ticker.init(FPS);
      Human.SPEED = defaultSpeed;
    });
    it("human walk one frame forward directory to company", () => {
      Human.SPEED = 1;
      const c = new Company(1, 1, 0);
      const r = new Residence([c], 0, 0);
      r._setNext(c, c, distance(c, r));
      const h = new Human(r, c);
      h._step();
      expect(h.loc().x).toEqual(Human.SPEED / FPS);
      expect(h.loc().y).toEqual(0);
    });

    it("human walk Human.SPEED in FPS frames", () => {
      const c = new Company(1, Human.SPEED, 0);
      const r = new Residence([c], 0, 0);
      r._setNext(c, c, distance(c, r));
      const h = new Human(r, c);
      for (let j = 0; j < FPS; j++) h._step();
      expect(h.loc().x).toEqual(Human.SPEED);
      expect(h.loc().y).toEqual(0);
    });
    it("human walk after turning theta radian", () => {
      Human.SPEED = 5;
      const c = new Company(1, 6, 8);
      const r = new Residence([c], 0, 0);
      r._setNext(c, c, distance(c, r));
      const h = new Human(r, c);
      for (let j = 0; j < FPS; j++) h._step();
      expect(h.loc().x).toBeCloseTo(3);
      expect(h.loc().y).toBeCloseTo(4);
    });

    it("stop destination, avoiding over step", () => {
      Human.SPEED = 5;
      const c = new Company(1, 3, 4);
      const r = new Residence([c], 0, 0);
      r._setNext(c, c, distance(c, r));
      const h = new Human(r, c);
      for (let j = 0; j < FPS; j++) h._step();
      expect(h.loc().x).toBeCloseTo(3);
      expect(h.loc().y).toBeCloseTo(4);
    });
  });
});
