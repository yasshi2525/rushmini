import creators from "entities/creator";
import preserveEntityCreator from "entities/loader";
import cityResource from "models/city_resource";
import modelListener, { EventType } from "models/listener";
import Platform from "models/platform";
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

describe("station_builder", () => {
  let scene: g.Scene;
  let panel: g.E;
  let ps: Platform[];

  beforeEach(async () => {
    ps = [];
    scorer.init({ score: 0 });
    scene = await createLoadedScene();
    creators.init();
    preserveEntityCreator();
    viewer.init(scene);
    panel = viewer.viewers[ViewerType.STATION_BUILDER];
    modelListener.find(EventType.CREATED, Platform).register((p) => ps.push(p));
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
    g.game.tick(false);
  });

  it("station creation is started when rail edge is cliked", () => {
    userResource.start(0, 0);
    userResource.extend(100, 100);
    userResource.extend(200, 200);
    userResource.end();
    expect(ps.length).toEqual(2);

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

    expect(ps.length).toEqual(3);
    expect(ps[2].loc().x).toBeCloseTo(100);
    expect(ps[2].loc().y).toBeCloseTo(100);

    expect(panel.visible()).toBeFalsy();
  });

  it("forbit to create station when cursor position is far", () => {
    userResource.start(0, 0);
    userResource.extend(200, 200);
    userResource.end();

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

    expect(ps.length).toEqual(2);
    expect(panel.visible()).toBeTruthy();
  });

  it("remove", () => {
    userResource.start(0, 0);
    userResource.extend(200, 200);
    userResource.end();
    userResource.rollback();
  });
});
