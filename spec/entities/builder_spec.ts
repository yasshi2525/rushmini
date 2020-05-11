import preserveEntityCreator from "entities/loader";
import DeptTask from "models/dept_task";
import EdgeTask from "models/edge_task";
import modelListener from "models/listener";
import userResource, { ModelState } from "models/user_resource";
import random from "utils/random";
import scorer from "utils/scorer";
import viewer, { ViewerType } from "utils/viewer";

import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => Promise<void>;

beforeAll(() => {
  random.init(new g.XorshiftRandomGenerator(0));
});

describe("railbuilder", () => {
  let scene: g.Scene;
  let panel: g.E;

  beforeEach(async () => {
    scorer.init({ score: 0 });
    scene = await createLoadedScene(true);
    preserveEntityCreator();
    viewer.init(scene);
    panel = viewer.viewers[ViewerType.BUILDER];
  });

  afterEach(async () => {
    viewer.reset();
    userResource.reset();
    modelListener.flush();
    await recreateGame();
  });

  it("dragging starts rail building", () => {
    panel.pointDown.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      point: { x: 10, y: 20 },
      type: g.EventType.PointDown,
      pointerId: 1,
      target: panel,
    });
    const dept = userResource.getPrimaryLine().top;
    expect(dept).toBeInstanceOf(DeptTask);
    expect(dept.departure().loc()).toEqual({ x: 10, y: 20 });
    expect(dept.next).toEqual(dept);
  });

  it("dragging extends rail", () => {
    panel.pointDown.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      point: { x: 10, y: 20 },
      type: g.EventType.PointDown,
      pointerId: 1,
      target: panel,
    });
    panel.pointMove.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      type: g.EventType.PointMove,
      pointerId: 2,
      point: { x: 10, y: 20 },
      startDelta: { x: 30, y: 31 },
      prevDelta: { x: 30, y: 31 },
      target: panel,
    });
    const dept = userResource.getPrimaryLine().top;
    expect(dept).toBeInstanceOf(DeptTask);
    expect(dept.departure().loc()).toEqual({ x: 10, y: 20 });

    const outbound = dept.next;
    expect(outbound).toBeInstanceOf(EdgeTask);
    expect(outbound.departure().loc()).toEqual({ x: 10, y: 20 });
    expect(outbound.destination().loc()).toEqual({ x: 40, y: 51 });

    const inbound = outbound.next;
    expect(inbound).toBeInstanceOf(EdgeTask);
    expect(inbound.departure().loc()).toEqual({ x: 40, y: 51 });
    expect(inbound.destination().loc()).toEqual({ x: 10, y: 20 });

    expect(inbound.next).toEqual(dept);
  });

  it("dragging ends rail", () => {
    panel.pointDown.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      point: { x: 10, y: 20 },
      type: g.EventType.PointDown,
      pointerId: 1,
      target: panel,
    });
    panel.pointMove.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      type: g.EventType.PointMove,
      pointerId: 2,
      point: { x: 10, y: 20 },
      startDelta: { x: 1, y: 2 },
      prevDelta: { x: 1, y: 2 },
      target: panel,
    });
    panel.pointUp.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      type: g.EventType.PointUp,
      pointerId: 3,
      point: { x: 10, y: 20 },
      startDelta: { x: 1, y: 2 },
      prevDelta: { x: 1, y: 2 },
      target: panel,
    });
    const dept1 = userResource.getPrimaryLine().top;
    expect(dept1).toBeInstanceOf(DeptTask);
    expect(dept1.departure().loc()).toEqual({ x: 10, y: 20 });

    const outbound = dept1.next;
    expect(outbound).toBeInstanceOf(EdgeTask);
    expect(outbound.departure().loc()).toEqual({ x: 10, y: 20 });
    expect(outbound.destination().loc()).toEqual({ x: 11, y: 22 });

    const dept2 = outbound.next;
    expect(dept2).toBeInstanceOf(DeptTask);
    expect(dept2.departure().loc()).toEqual({ x: 11, y: 22 });

    const inbound = dept2.next;
    expect(inbound).toBeInstanceOf(EdgeTask);
    expect(inbound.departure().loc()).toEqual({ x: 11, y: 22 });
    expect(inbound.destination().loc()).toEqual({ x: 10, y: 20 });

    expect(inbound.next).toEqual(dept1);

    expect(panel.visible()).toBeFalsy();
  });
});
