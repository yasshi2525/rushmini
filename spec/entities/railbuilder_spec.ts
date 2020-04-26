import { createLoadedScene } from "../_helper/scene";
import createRailBuilder from "entities/railbuilder";
import userResource, { ModelStateType } from "models/user_resource";
import DeptTask from "models/dept_task";
import EdgeTask from "models/edge_task";
import modelListener from "models/listener";

declare const recreateGame: () => void;

describe("railbuilder", () => {
  let scene: g.Scene;

  beforeEach(async () => {
    scene = await createLoadedScene(g.game);
  });

  afterEach(() => {
    userResource.reset();
    modelListener.flush();
    recreateGame();
  });

  it("dragging starts rail building", () => {
    const panel = createRailBuilder(scene);
    panel.children[0].pointDown.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      point: { x: 10, y: 20 },
      type: g.EventType.PointDown,
      pointerId: 1,
      target: panel,
    });
    const dept = userResource.primaryLine.top;
    expect(dept).toBeInstanceOf(DeptTask);
    expect(dept._getDept().loc()).toEqual({ x: 10, y: 20 });
    expect(dept.next).toEqual(dept);
  });

  it("dragging extends rail", () => {
    const panel = createRailBuilder(scene);
    const sensor = panel.children[0];
    sensor.pointDown.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      point: { x: 10, y: 20 },
      type: g.EventType.PointDown,
      pointerId: 1,
      target: panel,
    });
    sensor.pointMove.fire({
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
    const dept = userResource.primaryLine.top;
    expect(dept).toBeInstanceOf(DeptTask);
    expect(dept._getDept().loc()).toEqual({ x: 10, y: 20 });

    const outbound = dept.next;
    expect(outbound).toBeInstanceOf(EdgeTask);
    expect(outbound._getDept().loc()).toEqual({ x: 10, y: 20 });
    expect(outbound._getDest().loc()).toEqual({ x: 11, y: 22 });

    const inbound = outbound.next;
    expect(inbound).toBeInstanceOf(EdgeTask);
    expect(inbound._getDept().loc()).toEqual({ x: 11, y: 22 });
    expect(inbound._getDest().loc()).toEqual({ x: 10, y: 20 });

    expect(inbound.next).toEqual(dept);
  });

  it("dragging ends rail", () => {
    const panel = createRailBuilder(scene);
    const sensor = panel.children[0];
    sensor.pointDown.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      point: { x: 10, y: 20 },
      type: g.EventType.PointDown,
      pointerId: 1,
      target: panel,
    });
    sensor.pointMove.fire({
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
    sensor.pointUp.fire({
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
    const dept1 = userResource.primaryLine.top;
    expect(dept1).toBeInstanceOf(DeptTask);
    expect(dept1._getDept().loc()).toEqual({ x: 10, y: 20 });

    const outbound = dept1.next;
    expect(outbound).toBeInstanceOf(EdgeTask);
    expect(outbound._getDept().loc()).toEqual({ x: 10, y: 20 });
    expect(outbound._getDest().loc()).toEqual({ x: 11, y: 22 });

    const dept2 = outbound.next;
    expect(dept2).toBeInstanceOf(DeptTask);
    expect(dept2._getDept().loc()).toEqual({ x: 11, y: 22 });

    const inbound = dept2.next;
    expect(inbound).toBeInstanceOf(EdgeTask);
    expect(inbound._getDept().loc()).toEqual({ x: 11, y: 22 });
    expect(inbound._getDest().loc()).toEqual({ x: 10, y: 20 });

    expect(inbound.next).toEqual(dept1);
  });

  it("re-dragging causes nothing", () => {
    const panel = createRailBuilder(scene);
    const sensor = panel.children[0];
    sensor.pointDown.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      point: { x: 10, y: 20 },
      type: g.EventType.PointDown,
      pointerId: 1,
      target: panel,
    });
    sensor.pointMove.fire({
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
    sensor.pointUp.fire({
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

    expect(userResource.getState()).toEqual(ModelStateType.FIXED);

    sensor.pointDown.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      point: { x: 10, y: 20 },
      type: g.EventType.PointDown,
      pointerId: 4,
      target: panel,
    });

    expect(userResource.getState()).toEqual(ModelStateType.FIXED);

    sensor.pointMove.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      type: g.EventType.PointMove,
      pointerId: 5,
      point: { x: 10, y: 20 },
      startDelta: { x: 1, y: 2 },
      prevDelta: { x: 1, y: 2 },
      target: panel,
    });

    expect(userResource.getState()).toEqual(ModelStateType.FIXED);

    sensor.pointUp.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      type: g.EventType.PointUp,
      pointerId: 6,
      point: { x: 10, y: 20 },
      startDelta: { x: 1, y: 2 },
      prevDelta: { x: 1, y: 2 },
      target: panel,
    });

    expect(userResource.getState()).toEqual(ModelStateType.FIXED);
  });
});
