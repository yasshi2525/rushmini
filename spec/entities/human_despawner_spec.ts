import createHumanDespawner from "entities/human_despawner";
import Company from "models/company";
import Human, { HumanState } from "models/human";
import modelListener, { EventType } from "models/listener";
import { distance } from "models/pointable";
import RailLine from "models/rail_line";
import RailNode from "models/rail_node";
import Residence from "models/residence";
import Train from "models/train";
import ticker from "utils/ticker";

import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => Promise<void>;

const FPS = 60;
const LIFE_SPAN = 1;
const oldLIFE_SPAN = Human.LIFE_SPAN;
const oldBUFF = Human.STAY_BUFF;
const ANIMATION_SEC = 1;

beforeAll(() => {
  ticker.init(FPS);
  Human.LIFE_SPAN = LIFE_SPAN;
  Human.STAY_BUFF = 1;
});

afterAll(() => {
  Human.LIFE_SPAN = oldLIFE_SPAN;
  Human.STAY_BUFF = oldBUFF;
});

describe("human_despawner", () => {
  let scene: g.Scene;
  let c: Company;
  let r: Residence;

  beforeEach(async () => {
    scene = await createLoadedScene();
    c = new Company(1, 0, 0);
    r = new Residence([c], 0, 0);
  });

  afterEach(async () => {
    modelListener.flush();
    modelListener.unregisterAll();
    await recreateGame();
  });

  it("panel is created when human is died", () => {
    const panel = createHumanDespawner(scene);
    expect(panel.children).toBeUndefined();
    expect(scene.update.length).toEqual(0);

    const h = new Human(r, c);
    for (let i = 0; i < FPS * LIFE_SPAN + 1; i++) h._step();
    expect(h.state()).toEqual(HumanState.DIED);
    modelListener.fire(EventType.DELETED);

    expect(panel.children.length).toEqual(1);
    expect(scene.update.length).toEqual(1);
  });

  it("panel is disapear after ANIMATION_SEC sec", () => {
    const panel = createHumanDespawner(scene);
    const h = new Human(r, c);
    for (let i = 0; i < FPS * LIFE_SPAN + 1; i++) h._step();
    modelListener.fire(EventType.DELETED);
    const y = panel.children[0].y;

    for (let i = 0; i < FPS * ANIMATION_SEC - 1; i++) {
      g.game.tick(true);
      expect(panel.children.length).toEqual(1);
      expect(scene.update.length).toEqual(1);
      if (i > 0) expect(panel.children[0].y).toBeLessThan(y);
    }
    g.game.tick(true);
    expect(panel.children.length).toEqual(0);
    expect(scene.update.length).toEqual(0);
  });

  it("panel never moved when human is archived", () => {
    const panel = createHumanDespawner(scene);
    r._setNext(c, c, distance(c, r));
    const h = new Human(r, c);
    h._step();
    expect(h.state()).toEqual(HumanState.ARCHIVED);
    modelListener.fire(EventType.DELETED);
    const y = panel.children[0].y;
    for (let i = 0; i < FPS * ANIMATION_SEC - 1; i++) {
      g.game.tick(true);
      expect(panel.children[0].y).toEqual(y);
    }
  });

  it("panel move with train", () => {
    const panel = createHumanDespawner(scene);
    const h = new Human(r, c);
    const p = new RailNode(0, 0)._buildStation();
    const l = new RailLine();
    l._start(p);
    const t = new Train(l.top);
    h._setTrain(t);
    for (let i = 0; i < FPS * LIFE_SPAN + 1; i++) h._step();
    modelListener.fire(EventType.DELETED);
    for (let i = 0; i < FPS * ANIMATION_SEC - 1; i++) {
      g.game.tick(true);
    }
  });
});
