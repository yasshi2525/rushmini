import creators from "entities/creator";
import preserveEntityCreator from "entities/loader";
import cityResource from "models/city_resource";
import modelListener, { EventType } from "models/listener";
import Platform from "models/platform";
import Residence from "models/residence";
import userResource from "models/user_resource";
import random from "utils/random";
import routeFinder from "utils/route_finder";
import scorer from "utils/scorer";
import transportFinder from "utils/transport_finder";
import viewer, { ViewerType } from "utils/viewer";

import { createLoadedScene } from "../_helper/scene";

beforeAll(() => {
  random.init(new g.XorshiftRandomGenerator(0));
});

describe("residence_builder", () => {
  let scene: g.Scene;
  let panel: g.E;
  let rs: Residence[];

  beforeEach(async () => {
    rs = [];
    scorer.init({ score: 0 });
    scene = await createLoadedScene();
    creators.init();
    preserveEntityCreator();
    viewer.init(scene);
    panel = viewer.viewers[ViewerType.RESIDENCE_BUILDER];
    modelListener
      .find(EventType.CREATED, Residence)
      .register((r) => rs.push(r));
  });

  afterEach(() => {
    viewer.reset();
    creators.reset();
    userResource.reset();
    cityResource.reset();
    transportFinder.reset();
    routeFinder.reset();
    modelListener.flush();
    modelListener.unregisterAll();
    g.game.popScene();
    g.game.tick(true);
  });

  it("click builds residence", () => {
    panel.show();

    panel.pointUp.fire({
      local: undefined,
      player: { id: "dummyPlayerID" },
      point: { x: 100, y: 100 },
      prevDelta: { x: 0, y: 0 },
      startDelta: { x: 0, y: 0 },
      priority: 2,
      pointerId: 1,
      target: panel,
      type: g.EventType.PointUp,
    });

    expect(rs.length).toEqual(1);
    expect(rs[0].loc().x).toBeCloseTo(100);
    expect(rs[0].loc().y).toBeCloseTo(100);

    expect(panel.visible()).toBeFalsy();
    g.game.tick(true);
  });
});
