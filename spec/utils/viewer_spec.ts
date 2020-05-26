import creators from "entities/creator";
import preserveEntityCreator from "entities/loader";
import Company from "models/company";
import Human from "models/human";
import modelListener, { EventType } from "models/listener";
import Residence from "models/residence";
import random from "utils/random";
import scorer, { ScoreEvent } from "utils/scorer";
import viewer, { ViewerEvent, ViewerType } from "utils/viewer";

import { createLoadedScene } from "../_helper/scene";

describe("controller", () => {
  let scene: g.Scene;
  let rs: Residence[];

  beforeEach(async () => {
    random.init(new g.XorshiftRandomGenerator(0));
    scorer.init({ score: 0 });
    scene = await createLoadedScene();
    creators.init();
    preserveEntityCreator();
    rs = [];
    modelListener
      .find(EventType.CREATED, Residence)
      .register((r) => rs.push(r));
  });

  afterEach(() => {
    scorer.reset();
    creators.reset();
    viewer.reset();
    g.game.popScene();
    g.game.tick(false);
    modelListener.unregisterAll();
    modelListener.flush();
  });

  it("init creates panels", () => {
    viewer.init(scene);
    Object.keys(ViewerType)
      .map((key) => parseInt(key, 10))
      .filter((key) => !isNaN(key))
      .forEach((key: ViewerType) => {
        expect(viewer.viewers[key]).not.toBeUndefined();
      });
  });

  it("score builds residence", () => {
    viewer.init(scene);
    expect(rs.length).toEqual(1);
    const c = new Company(1, 100, 0);
    const h = new Human(rs[0], c, (min, max) => random.random().get(min, max));
    modelListener.add(EventType.CREATED, new ScoreEvent(490, h));
    modelListener.fire(EventType.CREATED);
    expect(rs.length).toEqual(1);
    modelListener.add(EventType.CREATED, new ScoreEvent(30, h));
    modelListener.add(EventType.CREATED, new ScoreEvent(-10, h));
    expect(rs.length).toEqual(1);
    modelListener.fire(EventType.CREATED);
    expect(rs.length).toEqual(2);
  });
});
