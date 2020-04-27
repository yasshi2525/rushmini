import Company from "models/company";
import Human from "models/human";
import modelListener from "models/listener";
import Residence from "models/residence";

const oldFps = Human.FPS;
const oldSpeed = Human.SPEED;

const fps = 30;
const defaultSpeed = 20;

const setEnv = () => {
  Human.FPS = fps;
  Human.SPEED = defaultSpeed;
};

const doNothing = (): void => undefined;

beforeAll(() => {
  setEnv();
});

afterAll(() => {
  modelListener.flush();
  Human.FPS = oldFps;
  Human.SPEED = oldSpeed;
});

describe("human", () => {
  it("initialize", () => {
    const c = new Company(1, 1, 2);
    const r = new Residence([c], 3, 4, doNothing);
    const h = new Human(r, c);
    expect(h.loc().x).toEqual(3);
    expect(h.loc().y).toEqual(4);
  });

  describe("_step", () => {
    beforeEach(() => {
      setEnv();
    });
    it("human walk one frame forward directory to company", () => {
      Human.SPEED = 1;
      const c = new Company(1, 1, 0);
      const r = new Residence([c], 0, 0, doNothing);
      const h = new Human(r, c);
      h._step(1);
      expect(h.loc().x).toEqual(Human.SPEED / Human.FPS);
      expect(h.loc().y).toEqual(0);
    });

    it("human walk Human.SPEED in FPS frames", () => {
      const c = new Company(1, Human.SPEED, 0);
      const r = new Residence([c], 0, 0, doNothing);
      const h = new Human(r, c);
      h._step(Human.FPS);
      expect(h.loc().x).toEqual(Human.SPEED);
      expect(h.loc().y).toEqual(0);
    });
    it("human walk after turning theta radian", () => {
      Human.SPEED = 5;
      const c = new Company(1, 6, 8);
      const r = new Residence([c], 0, 0, doNothing);
      const h = new Human(r, c);
      h._step(Human.FPS);
      expect(h.loc().x).toBeCloseTo(3);
      expect(h.loc().y).toBeCloseTo(4);
    });

    it("stop destination, avoiding over step", () => {
      Human.SPEED = 10;
      const c = new Company(1, 3, 4);
      const r = new Residence([c], 0, 0, doNothing);
      const h = new Human(r, c);
      h._step(Human.FPS);
      expect(h.loc().x).toEqual(3);
      expect(h.loc().y).toEqual(4);
    });
  });
});
