import Company from "models/company";
import DeptTask from "models/dept_task";
import Human, { HumanState } from "models/human";
import modelListener, { EventType } from "models/listener";
import { distance } from "models/pointable";
import RailLine from "models/rail_line";
import RailNode from "models/rail_node";
import Residence from "models/residence";
import Train from "models/train";
import random from "utils/random";
import { ScoreEvent } from "utils/scorer";
import ticker from "utils/ticker";

let oldWarn: (msg: string) => void;
const oldRAND = Human.RAND;
const oldS = Human.SPEED;
const oldSTAMINA = Human.LIFE_SPAN;

const FPS = 30;
const defaultSpeed = 20;

beforeAll(() => {
  oldWarn = console.warn;
  random.init(new g.XorshiftRandomGenerator(0));
  ticker.init(FPS);
  Human.RAND = 0;
  Human.LIFE_SPAN = 10000;
});

afterAll(() => {
  modelListener.flush();
  ticker.reset();
  Human.RAND = oldRAND;
  Human.SPEED = defaultSpeed;
  Human.LIFE_SPAN = oldSTAMINA;
});

describe("human", () => {
  beforeEach(() => {
    Human.LIFE_SPAN = 10000;
  });
  afterEach(() => {
    console.warn = oldWarn;
    modelListener.flush();
  });

  it("initialize", () => {
    const c = new Company(1, 1, 2);
    const r = new Residence([c], 3, 4, (min, max) =>
      random.random().get(min, max)
    );
    const h = new Human(r, c, (min, max) => random.random().get(min, max));
    expect(h.loc().x).toEqual(3);
    expect(h.loc().y).toEqual(4);
  });

  it("_fire", () => {
    console.warn = jest.fn();
    const c = new Company(1, 1, 2);
    const r = new Residence([c], 3, 4, (min, max) =>
      random.random().get(min, max)
    );
    const h = new Human(r, c, (min, max) => random.random().get(min, max));
    h._fire();
    expect(h.state()).toEqual(HumanState.SPAWNED);
    expect(console.warn).toHaveBeenCalled();
  });

  it("_giveup", () => {
    console.warn = jest.fn();
    const c = new Company(1, 1, 2);
    const r = new Residence([c], 3, 4, (min, max) =>
      random.random().get(min, max)
    );
    const h = new Human(r, c, (min, max) => random.random().get(min, max));
    h._giveup();
    expect(h.state()).toEqual(HumanState.SPAWNED);
    expect(console.warn).toHaveBeenCalled();
  });

  describe("_step", () => {
    beforeEach(() => {
      ticker.init(FPS);
      Human.SPEED = defaultSpeed;
    });
    afterEach(() => {
      modelListener.unregisterAll();
      Human.LIFE_SPAN = 10000;
    });

    it("human walk one frame forward directory to company", () => {
      Human.SPEED = 1;
      const c = new Company(1, 1, 0);
      const r = new Residence([c], 0, 0, (min, max) =>
        random.random().get(min, max)
      );
      r._setNext(c, c, distance(c, r));
      const h = new Human(r, c, (min, max) => random.random().get(min, max));
      h._step();
      expect(h.loc().x).toEqual(Human.SPEED / FPS);
      expect(h.loc().y).toEqual(0);
    });

    it("human walk Human.SPEED in FPS frames", () => {
      const c = new Company(1, Human.SPEED, 0);
      const r = new Residence([c], 0, 0, (min, max) =>
        random.random().get(min, max)
      );
      r._setNext(c, c, distance(c, r));
      const h = new Human(r, c, (min, max) => random.random().get(min, max));
      for (let j = 0; j < FPS; j++) h._step();
      expect(h.loc().x).toEqual(Human.SPEED);
      expect(h.loc().y).toEqual(0);
    });
    it("human walk after turning theta radian", () => {
      Human.SPEED = 5;
      const c = new Company(1, 6, 8);
      const r = new Residence([c], 0, 0, (min, max) =>
        random.random().get(min, max)
      );
      r._setNext(c, c, distance(c, r));
      const h = new Human(r, c, (min, max) => random.random().get(min, max));
      for (let j = 0; j < FPS; j++) h._step();
      expect(h.loc().x).toBeCloseTo(3);
      expect(h.loc().y).toBeCloseTo(4);
    });

    it("stop destination, avoiding over step", () => {
      Human.SPEED = 5;
      const c = new Company(1, 3, 4);
      const r = new Residence([c], 0, 0, (min, max) =>
        random.random().get(min, max)
      );
      r._setNext(c, c, distance(c, r));
      const h = new Human(r, c, (min, max) => random.random().get(min, max));

      for (let j = 0; j < FPS; j++) h._step();

      expect(h.loc().x).toBeCloseTo(3);
      expect(h.loc().y).toBeCloseTo(4);
      expect(h.state()).toEqual(HumanState.MOVE);

      h._step();

      expect(h.state()).toEqual(HumanState.ARCHIVED);
      expect(h.loc().x).toBeCloseTo(3);
      expect(h.loc().y).toBeCloseTo(4);

      h._step();
      expect(h.state()).toEqual(HumanState.ARCHIVED);
    });

    it("staying human is died after STAMINA * BUFF seconds", () => {
      Human.SPEED = 1;
      Human.LIFE_SPAN = 10;
      const c = new Company(1, 1, 1);
      const r = new Residence([c], 0, 0, (min, max) =>
        random.random().get(min, max)
      );

      const h = new Human(r, c, (min, max) => random.random().get(min, max));
      for (
        let i = 0;
        i < Human.LIFE_SPAN * (1 / Human.STAY_BUFF) * FPS - 1;
        i++
      ) {
        h._step();
        expect(h.state()).toEqual(HumanState.SPAWNED);
      }
      h._step();
      expect(h.state()).toEqual(HumanState.DIED);
    });

    it("walking human is died after STAMINA seconds", () => {
      Human.SPEED = 1;
      Human.LIFE_SPAN = 10;
      const c = new Company(1, 1000, 1000);
      const r = new Residence([c], 0, 0, (min, max) =>
        random.random().get(min, max)
      );
      r._setNext(c, c, distance(c, r));
      const h = new Human(r, c, (min, max) => random.random().get(min, max));

      for (let i = 0; i < Human.LIFE_SPAN * FPS; i++) {
        h._step();
        expect(h.state()).toEqual(HumanState.MOVE);
      }
      h._step();
      expect(h.state()).toEqual(HumanState.DIED);
    });
  });

  it("payment after arrival", () => {
    const c = new Company(1, 3, 4);
    const r = new Residence([c], 0, 0, (min, max) =>
      random.random().get(min, max)
    );
    const rn = new RailNode(0, 0);
    const p1 = rn._buildStation();
    const g1 = p1.station.gate;
    const e12 = rn._extend(3, 4);
    const p2 = e12.to._buildStation();
    const g2 = p2.station.gate;
    const l = new RailLine();
    l._start(p1);
    l._insertEdge(e12);
    const t = new Train(l.top);
    let score = 0;
    modelListener
      .find(EventType.CREATED, ScoreEvent)
      .register((ev: ScoreEvent) => (score += ev.value));
    g2._setNext(c, c, distance(c, g2));
    p2._setNext(g2, c, distance(c, p2));
    l.top._setNext(p2, c, distance(c, p1));
    l.top._setNext(p2, p2, distance(p2, p1), distance(p2, p1));
    p1._setNext(l.top, c, distance(c, p1));
    g1._setNext(p1, c, distance(c, g1));
    r._setNext(g1, c, distance(c, r));

    const h = new Human(r, c, (min, max) => random.random().get(min, max));
    expect(h.state()).toEqual(HumanState.SPAWNED);
    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_GATE);
    g1._step();
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_PLATFORM);
    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_ENTER_DEPTQUEUE);
    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_TRAIN_ARRIVAL);
    for (let j = 0; j < Train.STAY_SEC * FPS - 1; j++) {
      t._step();
      expect(t.current()._base()).toBeInstanceOf(DeptTask);
      expect(h.state()).toEqual(HumanState.ON_TRAIN);
    }
    for (let j = 0; j < (5 * FPS) / Train.SPEED; j++) {
      t._step();
      expect(h.state()).toEqual(HumanState.ON_TRAIN);
    }
    modelListener.fire(EventType.CREATED);
    expect(score).toEqual(0);
    t._step();
    expect(h.state()).toEqual(HumanState.WAIT_EXIT_PLATFORM);
    modelListener.fire(EventType.CREATED);
    expect(score).toEqual(0);
    h._step();
    expect(h.state()).toEqual(HumanState.WAIT_EXIT_GATE);
    modelListener.fire(EventType.CREATED);
    expect(score).toEqual(0);
    g2._step();
    expect(h.state()).toEqual(HumanState.MOVE);
    modelListener.fire(EventType.CREATED);
    expect(score).toEqual(5);
  });
});
