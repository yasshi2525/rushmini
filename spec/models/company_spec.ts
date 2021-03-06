import Company from "models/company";
import Human, { HumanState } from "models/human";
import modelListener from "models/listener";
import { distance } from "models/pointable";
import Residence from "models/residence";
import random from "utils/random";
import ticker from "utils/ticker";

const FPS = 15;
const oldRAND = Human.RAND;
const oldSpeed = Human.SPEED;

beforeAll(() => {
  random.init(new g.XorshiftRandomGenerator(0));
  ticker.init(FPS);
  Human.RAND = 0;
  Human.SPEED = 1;
});

afterAll(() => {
  modelListener.flush();
  ticker.reset();
  Human.RAND = oldRAND;
  Human.SPEED = oldSpeed;
});

describe("company", () => {
  it("initialize", () => {
    const c = new Company(1, 1, 2);
    expect(c.loc().x).toEqual(1);
    expect(c.loc().y).toEqual(2);
  });

  it("forbit non-nature value attractiveness", () => {
    const c = new Company(0, 0, 0);
    expect(c.attractiveness).toEqual(1);
  });

  it("move human to close company", () => {
    const c = new Company(1, 3, 4);
    const r = new Residence([c], 0, 0, (min, max) =>
      random.random().get(min, max)
    );
    r._setNext(c, c, distance(c, r));
    const h = new Human(r, c, (min, max) => random.random().get(min, max));
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < FPS; j++) h._step();
      expect(distance(c, h)).toBeCloseTo(5 - i - 1);
      expect(h.state()).toEqual(HumanState.MOVE);
    }
    for (let j = 0; j < FPS; j++) h._step();
    expect(h.state()).toEqual(HumanState.ARCHIVED);
  });

  it("_giveup", () => {
    const c = new Company(1, 1, 2);
    c._giveup(undefined);
  });
});
