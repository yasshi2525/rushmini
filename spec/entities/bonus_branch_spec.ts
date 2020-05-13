import preserveEntityCreator from "entities/loader";
import cityResource from "models/city_resource";
import modelListener from "models/listener";
import userResource from "models/user_resource";
import random from "utils/random";
import routeFinder from "utils/route_finder";
import scorer from "utils/scorer";
import transportFinder from "utils/transport_finder";
import viewer, { ViewerType } from "utils/viewer";

import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => Promise<void>;

const scoreBorders = [1000, 2000, 4000, 8000];

beforeEach(() => {
  random.init(new g.XorshiftRandomGenerator(0));
});

describe("bonus_branch", () => {
  let scene: g.Scene;
  let panel: g.E;
  let branch: g.E;
  let shadow: g.E;
  let branch_builder: g.E;

  beforeEach(async () => {
    scorer.init({ score: 0 });
    scene = await createLoadedScene(true);
    preserveEntityCreator();
    viewer.init(scene);
    panel = viewer.viewers[ViewerType.BONUS];
    branch = viewer.viewers[ViewerType.BONUS_BRANCH];
    shadow = viewer.viewers[ViewerType.SHADOW];
    branch_builder = viewer.viewers[ViewerType.BRANCH_BUILDER];
  });

  afterEach(async () => {
    viewer.reset();
    userResource.reset();
    cityResource.reset();
    routeFinder.reset();
    transportFinder.reset();
    modelListener.flush();
    modelListener.unregisterAll();
    scorer.reset();
    await recreateGame();
  });

  it("button can be pushed after bonus panel is opened", () => {
    expect(panel.visible()).toBeFalsy();

    scorer.add(scoreBorders[0]);
    expect(panel.visible()).toBeTruthy();
    expect(branch.visible()).toBeTruthy();
  });

  it("bonus panel is hidden after button is pushed", () => {
    scorer.add(scoreBorders[0]);
    branch.pointUp.fire();

    expect(panel.visible()).toBeFalsy();
  });

  it("viewer mask is enabled after click bonus panel", () => {
    expect(shadow.visible()).toBeFalsy();

    scorer.add(scoreBorders[0]);

    expect(shadow.visible()).toBeTruthy();

    branch.pointUp.fire();

    expect(shadow.visible()).toBeTruthy();
  });

  it("candidate station is enabled after click bonus panel", () => {
    userResource.start(0, 0);
    userResource.extend(50, 50);
    userResource.end();

    expect(branch_builder.visible()).toBeFalsy();

    scorer.add(scoreBorders[0]);
    expect(branch_builder.visible()).toBeFalsy();

    branch.pointUp.fire();
    expect(branch_builder.visible()).toBeTruthy();

    expect(branch_builder.children[0].children.length).toEqual(2);
  });

  it("mask is hidden after candidate station is clicked", () => {
    userResource.start(0, 0);
    userResource.extend(50, 50);
    userResource.end();
    scorer.add(scoreBorders[0]);
    branch.pointUp.fire();
    branch_builder.pointDown.fire({
      local: undefined,
      player: { id: "dummyPlayerID" },
      point: { x: 2, y: 2 },
      priority: 2,
      pointerId: 1,
      target: branch_builder,
      type: g.EventType.PointDown,
    });
    expect(shadow.visible()).toBeFalsy();
  });

  it("isBonusing is false after station is branched", () => {
    userResource.start(0, 0);
    userResource.extend(50, 50);
    userResource.end();

    expect(viewer.isBonusing).toBeFalsy();

    scorer.add(scoreBorders[0]);

    expect(viewer.isBonusing).toBeTruthy();

    branch.pointUp.fire();

    expect(viewer.isBonusing).toBeTruthy();

    branch_builder.pointDown.fire({
      local: undefined,
      player: { id: "dummyPlayerID" },
      point: { x: 2, y: 2 },
      priority: 2,
      pointerId: 1,
      target: branch_builder,
      type: g.EventType.PointDown,
    });

    expect(viewer.isBonusing).toBeTruthy();

    branch_builder.pointMove.fire({
      local: undefined,
      player: { id: "dummyPlayerID" },
      point: { x: 2, y: 2 },
      prevDelta: { x: 0, y: 0 },
      startDelta: { x: 0, y: 0 },
      priority: 2,
      pointerId: 1,
      target: branch_builder,
      type: g.EventType.PointDown,
    });

    expect(viewer.isBonusing).toBeTruthy();

    branch_builder.pointUp.fire();

    expect(viewer.isBonusing).toBeFalsy();
  });
});
