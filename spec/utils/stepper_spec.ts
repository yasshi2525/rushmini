import Company from "models/company";
import Human from "models/human";
import modelListener, { EventType } from "models/listener";
import Platform from "models/platform";
import { distance } from "models/pointable";
import RailNode from "models/rail_node";
import Residence from "models/residence";
import Station from "models/station";
import stepper from "utils/stepper";
import ticker from "utils/ticker";

const FPS = 15;
const oldINTERVAL = Residence.INTERVAL_SEC;

beforeAll(() => ticker.init(FPS));

afterAll(() => {
  ticker.reset();
  Residence.INTERVAL_SEC = oldINTERVAL;
});

describe("stepper", () => {
  let hs: Human[];

  beforeEach(() => {
    Residence.INTERVAL_SEC = 1;
    stepper.init();
    const c = new Company(1, 3, 4);
    const r = new Residence([c], 0, 0);
    const rn = new RailNode(0, 0);
    const st = new Station();
    const g = st.gate;
    const p = new Platform(rn, st);
    r._setNext(c, c, distance(c, r));
    hs = [];
    modelListener.find(EventType.CREATED, Human).register((h) => hs.push(h));
  });

  afterEach(() => {
    stepper.reset();
    modelListener.unregisterAll();
    modelListener.flush();
  });

  it("ticking FPS frame creates one human", () => {
    for (let j = 0; j < FPS; j++) {
      stepper.step();
      expect(hs.length).toEqual(0);
    }
    stepper.step();
    expect(hs.length).toEqual(1);
  });

  it("ticking moves human", () => {
    let moveCount = 0;
    modelListener.find(EventType.MODIFIED, Human).register((h) => {
      if (hs[0] === h) {
        moveCount++;
      }
    });
    for (let i = 0; i < FPS; i++) {
      stepper.step();
      expect(moveCount).toEqual(0);
    }
    stepper.step();
    expect(moveCount).toEqual(0);
    stepper.step();
    expect(moveCount).toEqual(1);
  });
});
