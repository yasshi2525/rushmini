import Company from "models/company";
import Residence from "models/residence";
import Human from "models/human";
import modelListener from "models/listener";

const oldFps = Human.FPS;
const oldSpeed = Human.SPEED;

const fps = 30;
const defaultSpeed = 20;

const setEnv = () => {
  Human.FPS = fps;
  Human.SPEED = defaultSpeed;
};

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
    const r = new Residence([c], 1, 3, 4);
    const h = new Human(r, c);
    expect(h._getVector().x).toEqual(3);
    expect(h._getVector().y).toEqual(4);
  });

  describe("_step", () => {
    beforeEach(() => {
      setEnv();
    });
    it("human walk one frame forward directory to company", () => {
      Human.SPEED = 1;
      const c = new Company(1, 1, 0);
      const r = new Residence([c], 1, 0, 0);
      const h = new Human(r, c);
      h._step(1);
      expect(h._getVector().x).toEqual(Human.SPEED / Human.FPS);
      expect(h._getVector().y).toEqual(0);
    });

    it("human walk Human.SPEED in FPS frames", () => {
      const c = new Company(1, Human.SPEED, 0);
      const r = new Residence([c], 1, 0, 0);
      const h = new Human(r, c);
      h._step(Human.FPS);
      expect(h._getVector().x).toEqual(Human.SPEED);
      expect(h._getVector().y).toEqual(0);
    });
    it("human walk after turning theta radian", () => {
      Human.SPEED = 5;
      const c = new Company(1, 6, 8);
      const r = new Residence([c], 1, 0, 0);
      const h = new Human(r, c);
      h._step(Human.FPS);
      expect(h._getVector().x.toFixed(2)).toEqual("3.00");
      expect(h._getVector().y.toFixed(2)).toEqual("4.00");
    });

    it("stop destination, avoiding over step", () => {
      Human.SPEED = 10;
      const c = new Company(1, 3, 4);
      const r = new Residence([c], 1, 0, 0);
      const h = new Human(r, c);
      h._step(Human.FPS);
      expect(h._getVector().x).toEqual(3);
      expect(h._getVector().y).toEqual(4);
    });
  });
});
