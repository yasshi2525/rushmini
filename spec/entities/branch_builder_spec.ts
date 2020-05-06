import createBranchBuilder from "entities/branch_builder";
import modelListener from "models/listener";
import userResource, { ModelState } from "models/user_resource";
import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => Promise<void>;

describe("branch_builder", () => {
  let scene: g.Scene;

  beforeEach(async () => {
    scene = await createLoadedScene(true);
  });

  afterEach(async () => {
    userResource.reset();
    modelListener.flush();
    await recreateGame();
  });

  it("branch is started when candidate is selected", () => {
    let startCounter = 0;
    let endCounter = 0;
    const panel = createBranchBuilder(
      scene,
      () => startCounter++,
      () => endCounter++
    );

    userResource.start(0, 0);
    userResource.extend(3, 4);
    userResource.end();

    expect(startCounter).toEqual(0);
    expect(endCounter).toEqual(0);

    panel.show();

    const sprite = panel.children[0].children[0].children[0];
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
    expect(endCounter).toEqual(0);
    expect(userResource.getState()).toEqual(ModelState.STARTED);
  });

  it("branch is fixed after point up", () => {
    let startCounter = 0;
    let endCounter = 0;
    const panel = createBranchBuilder(
      scene,
      () => startCounter++,
      () => endCounter++
    );

    userResource.start(0, 0);
    userResource.extend(3, 4);
    userResource.end();

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
      startDelta: { x: 100, y: 0 },
      prevDelta: { x: 0, y: 0 },
      priority: 2,
      pointerId: 1,
      target: panel,
      type: g.EventType.PointMove,
    });

    expect(startCounter).toEqual(1);
    expect(endCounter).toEqual(0);
    expect(userResource.getState()).toEqual(ModelState.STARTED);

    panel.pointUp.fire({
      local: undefined,
      player: { id: "dummyPlayerID" },
      point: { x: 2, y: 2 },
      startDelta: { x: 100, y: 0 },
      prevDelta: { x: 100, y: 0 },
      priority: 2,
      pointerId: 1,
      target: panel,
      type: g.EventType.PointUp,
    });

    expect(startCounter).toEqual(1);
    expect(endCounter).toEqual(1);
    expect(userResource.getState()).toEqual(ModelState.FIXED);
    expect(panel.visible()).toBeFalsy();
  });

  it("forbit to branch when unrelated point is clicked", () => {
    let startCounter = 0;
    let endCounter = 0;
    const panel = createBranchBuilder(
      scene,
      () => startCounter++,
      () => endCounter++
    );

    userResource.start(0, 0);
    userResource.extend(3, 4);
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
    expect(endCounter).toEqual(0);
    expect(userResource.getState()).toEqual(ModelState.FIXED);
    expect(panel.visible()).toBeTruthy();
  });
});
