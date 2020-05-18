import preserveEntityCreator from "entities/loader";
import cityResource from "models/city_resource";
import modelListener from "models/listener";
import userResource, { ModelState } from "models/user_resource";
import random from "utils/random";
import scorer from "utils/scorer";
import viewer, { ViewerEvent, ViewerType } from "utils/viewer";

import { createLoadedScene } from "../_helper/scene";

beforeAll(() => {
  random.init(new g.XorshiftRandomGenerator(0));
});

describe("branch_builder", () => {
  let scene: g.Scene;
  let panel: g.E;
  let shadow: g.E;

  beforeEach(async () => {
    scorer.init({ score: 0 });
    scene = await createLoadedScene();
    preserveEntityCreator();
    viewer.init(scene);
    panel = viewer.viewers[ViewerType.BRANCH_BUILDER];
    shadow = viewer.viewers[ViewerType.SHADOW];
  });

  afterEach(async () => {
    viewer.reset();
    userResource.reset();
    cityResource.reset();
    modelListener.flush();
  });

  it("branch is started when candidate is selected", () => {
    let startCounter = 0;
    let isBranching = false;
    let endCounter = 0;
    viewer.register(ViewerEvent.BRANCHING, () => {
      startCounter++;
      isBranching = true;
    });
    viewer.register(ViewerEvent.BRANCHED, () => {
      isBranching = false;
      endCounter++;
    });

    userResource.start(0, 0);
    userResource.extend(300, 400);
    userResource.end();
    userResource.commit();

    expect(startCounter).toEqual(0);
    expect(isBranching).toBeFalsy();
    expect(endCounter).toEqual(0);

    panel.show();

    const sprite = panel.children[1].children[0].children[0];
    expect(sprite).toBeInstanceOf(g.Sprite);

    panel.pointDown.fire({
      local: undefined,
      player: { id: "dummyPlayerID" },
      point: { x: 2, y: 2 },
      priority: 2,
      pointerId: 1,
      target: panel,
      type: g.EventType.PointDown,
    });

    expect(startCounter).toEqual(1);
    expect(isBranching).toBeTruthy();
    expect(endCounter).toEqual(0);
    expect(userResource.getState()).toEqual(ModelState.STARTED);
  });

  it("branch is fixed after point up", () => {
    let startCounter = 0;
    let isBranching = false;
    let rollbakckCounter = 0;
    let endCounter = 0;
    viewer.register(ViewerEvent.BRANCHING, () => {
      startCounter++;
      isBranching = true;
    });
    viewer.register(ViewerEvent.BRANCH_ROLLBACKED, () => {
      rollbakckCounter++;
      isBranching = false;
    });
    viewer.register(ViewerEvent.BRANCHED, () => {
      isBranching = false;
      endCounter++;
    });

    userResource.start(0, 0);
    userResource.extend(300, 400);
    userResource.end();
    userResource.commit();

    panel.show();

    panel.pointDown.fire({
      local: undefined,
      player: { id: "dummyPlayerID" },
      point: { x: 2, y: 2 },
      priority: 2,
      pointerId: 1,
      target: panel,
      type: g.EventType.PointDown,
    });

    panel.pointMove.fire({
      local: undefined,
      player: { id: "dummyPlayerID" },
      point: { x: 2, y: 2 },
      startDelta: { x: 110, y: 0 },
      prevDelta: { x: 110, y: 0 },
      priority: 2,
      pointerId: 1,
      target: panel,
      type: g.EventType.PointMove,
    });

    expect(startCounter).toEqual(1);
    expect(isBranching).toBeTruthy();
    expect(endCounter).toEqual(0);
    expect(rollbakckCounter).toEqual(0);
    expect(userResource.getState()).toEqual(ModelState.STARTED);

    panel.pointUp.fire({
      local: undefined,
      player: { id: "dummyPlayerID" },
      point: { x: 2, y: 2 },
      startDelta: { x: 110, y: 0 },
      prevDelta: { x: 0, y: 0 },
      priority: 2,
      pointerId: 1,
      target: panel,
      type: g.EventType.PointUp,
    });

    expect(startCounter).toEqual(1);
    expect(isBranching).toBeFalsy();
    expect(rollbakckCounter).toEqual(0);
    expect(endCounter).toEqual(1);
    expect(userResource.getState()).toEqual(ModelState.FIXED);
    expect(panel.visible()).toBeFalsy();
  });

  it("rollback when dist is shorter", () => {
    let startCounter = 0;
    let isBranching = false;
    let rollbakckCounter = 0;
    let endCounter = 0;
    viewer.register(ViewerEvent.BRANCHING, () => {
      startCounter++;
      isBranching = true;
    });
    viewer.register(ViewerEvent.BRANCH_ROLLBACKED, () => {
      rollbakckCounter++;
      isBranching = false;
    });
    viewer.register(ViewerEvent.BRANCHED, () => {
      isBranching = false;
      endCounter++;
    });

    userResource.start(0, 0);
    userResource.extend(300, 400);
    userResource.end();
    userResource.commit();

    panel.show();

    panel.pointDown.fire({
      local: undefined,
      player: { id: "dummyPlayerID" },
      point: { x: 2, y: 2 },
      priority: 2,
      pointerId: 1,
      target: panel,
      type: g.EventType.PointDown,
    });

    panel.pointMove.fire({
      local: undefined,
      player: { id: "dummyPlayerID" },
      point: { x: 2, y: 2 },
      startDelta: { x: 30, y: 0 },
      prevDelta: { x: 30, y: 0 },
      priority: 2,
      pointerId: 1,
      target: panel,
      type: g.EventType.PointMove,
    });

    expect(startCounter).toEqual(1);
    expect(isBranching).toBeTruthy();
    expect(endCounter).toEqual(0);
    expect(rollbakckCounter).toEqual(0);
    expect(userResource.getState()).toEqual(ModelState.STARTED);

    panel.pointUp.fire({
      local: undefined,
      player: { id: "dummyPlayerID" },
      point: { x: 2, y: 2 },
      startDelta: { x: 30, y: 0 },
      prevDelta: { x: 0, y: 0 },
      priority: 2,
      pointerId: 1,
      target: panel,
      type: g.EventType.PointUp,
    });

    expect(startCounter).toEqual(1);
    expect(isBranching).toBeFalsy();
    expect(rollbakckCounter).toEqual(1);
    expect(endCounter).toEqual(0);
    expect(userResource.getState()).toEqual(ModelState.FIXED);
    expect(panel.visible()).toBeTruthy();
    expect(shadow.visible()).toBeTruthy();
  });

  it("forbit to branch when unrelated point is clicked", () => {
    let startCounter = 0;
    let isBranching = false;
    let endCounter = 0;

    viewer.register(ViewerEvent.USER_BONUS_STARTED, () => startCounter++);
    viewer.register(ViewerEvent.BRANCHING, () => (isBranching = true));
    viewer.register(ViewerEvent.BRANCHED, () => {
      isBranching = false;
      endCounter++;
    });

    userResource.start(0, 0);
    userResource.extend(300, 400);
    userResource.end();

    panel.show();

    panel.pointDown.fire({
      local: undefined,
      player: { id: "dummyPlayerID" },
      point: { x: 2000, y: 2000 },
      priority: 2,
      pointerId: 1,
      target: panel,
      type: g.EventType.PointDown,
    });

    expect(startCounter).toEqual(0);
    expect(isBranching).toBeFalsy();
    expect(endCounter).toEqual(0);
    expect(userResource.getState()).toEqual(ModelState.FIXED);

    panel.pointMove.fire({
      local: undefined,
      player: { id: "dummyPlayerID" },
      point: { x: 2000, y: 2000 },
      startDelta: { x: 100, y: 0 },
      prevDelta: { x: 0, y: 0 },
      priority: 2,
      pointerId: 1,
      target: panel,
      type: g.EventType.PointMove,
    });

    expect(startCounter).toEqual(0);
    expect(isBranching).toBeFalsy();
    expect(endCounter).toEqual(0);
    expect(userResource.getState()).toEqual(ModelState.FIXED);

    panel.pointUp.fire({
      local: undefined,
      player: { id: "dummyPlayerID" },
      point: { x: 2000, y: 2000 },
      startDelta: { x: 100, y: 0 },
      prevDelta: { x: 100, y: 0 },
      priority: 2,
      pointerId: 1,
      target: panel,
      type: g.EventType.PointUp,
    });

    expect(startCounter).toEqual(0);
    expect(isBranching).toBeFalsy();
    expect(endCounter).toEqual(0);
    expect(userResource.getState()).toEqual(ModelState.FIXED);
    expect(panel.visible()).toBeTruthy();
  });

  it("forbit to re-open during branching", () => {
    let bonusCounter = 0;
    const bonus = viewer.viewers[ViewerType.BONUS];
    viewer.register(ViewerEvent.USER_BONUS_STARTED, () => bonusCounter++);

    userResource.start(0, 0);
    userResource.extend(300, 400);
    userResource.end();

    scorer.add(10000);
    expect(bonus.visible()).toBeTruthy();
    expect(viewer.isBonusing).toBeTruthy();
    expect(bonusCounter).toEqual(1);

    viewer.fire(ViewerEvent.BRANCH_STARTED);

    expect(bonus.visible()).toBeFalsy();
    expect(viewer.isBonusing).toBeTruthy();

    panel.pointDown.fire({
      local: undefined,
      player: { id: "dummyPlayerID" },
      point: { x: 2, y: 2 },
      priority: 2,
      pointerId: 1,
      target: panel,
      type: g.EventType.PointDown,
    });

    scorer.add(10000);

    expect(bonus.visible()).toBeFalsy();
    expect(viewer.isBonusing).toBeTruthy();
    expect(bonusCounter).toEqual(1);

    panel.pointMove.fire({
      local: undefined,
      player: { id: "dummyPlayerID" },
      point: { x: 2, y: 2 },
      startDelta: { x: 110, y: 0 },
      prevDelta: { x: 110, y: 0 },
      priority: 2,
      pointerId: 1,
      target: panel,
      type: g.EventType.PointMove,
    });

    scorer.add(10000);

    expect(bonus.visible()).toBeFalsy();
    expect(viewer.isBonusing).toBeTruthy();
    expect(bonusCounter).toEqual(1);

    panel.pointUp.fire({
      local: undefined,
      player: { id: "dummyPlayerID" },
      point: { x: 2, y: 2 },
      startDelta: { x: 110, y: 0 },
      prevDelta: { x: 0, y: 0 },
      priority: 2,
      pointerId: 1,
      target: panel,
      type: g.EventType.PointUp,
    });

    expect(bonus.visible()).toBeFalsy();
    expect(viewer.isBonusing).toBeFalsy();
    expect(bonusCounter).toEqual(1);

    scorer.add(10000);

    expect(bonus.visible()).toBeTruthy();
    expect(viewer.isBonusing).toBeTruthy();
    expect(bonusCounter).toEqual(2);
  });
});
