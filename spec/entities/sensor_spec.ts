import createSensor from "entities/sensor";
import DeptTask from "models/dept_task";
import EdgeTask from "models/edge_task";
import modelListener from "models/listener";
import userResource, { ModelState } from "models/user_resource";
import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => Promise<void>;

describe("railbuilder", () => {
  let scene: g.Scene;

  beforeEach(async () => {
    scene = await createLoadedScene();
  });

  afterEach(async () => {
    userResource.reset();
    modelListener.flush();
    await recreateGame();
  });

  it("dragging starts rail building", () => {
    const panel = createSensor(scene);
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
    const sensor = createSensor(scene);
    sensor.pointDown.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      point: { x: 10, y: 20 },
      type: g.EventType.PointDown,
      pointerId: 1,
      target: sensor,
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
      target: sensor,
    });
    const dept = userResource.getPrimaryLine().top;
    expect(dept).toBeInstanceOf(DeptTask);
    expect(dept.departure().loc()).toEqual({ x: 10, y: 20 });

    const outbound = dept.next;
    expect(outbound).toBeInstanceOf(EdgeTask);
    expect(outbound.departure().loc()).toEqual({ x: 10, y: 20 });
    expect(outbound.destination().loc()).toEqual({ x: 11, y: 22 });

    const inbound = outbound.next;
    expect(inbound).toBeInstanceOf(EdgeTask);
    expect(inbound.departure().loc()).toEqual({ x: 11, y: 22 });
    expect(inbound.destination().loc()).toEqual({ x: 10, y: 20 });

    expect(inbound.next).toEqual(dept);
  });

  it("dragging ends rail", () => {
    const sensor = createSensor(scene);
    sensor.pointDown.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      point: { x: 10, y: 20 },
      type: g.EventType.PointDown,
      pointerId: 1,
      target: sensor,
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
      target: sensor,
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
      target: sensor,
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
  });

  it("re-dragging causes nothing", () => {
    const sensor = createSensor(scene);
    sensor.pointDown.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      point: { x: 10, y: 20 },
      type: g.EventType.PointDown,
      pointerId: 1,
      target: sensor,
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
      target: sensor,
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
      target: sensor,
    });

    expect(userResource.getState()).toEqual(ModelState.FIXED);

    sensor.pointDown.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      point: { x: 10, y: 20 },
      type: g.EventType.PointDown,
      pointerId: 4,
      target: sensor,
    });

    expect(userResource.getState()).toEqual(ModelState.FIXED);

    sensor.pointMove.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      type: g.EventType.PointMove,
      pointerId: 5,
      point: { x: 10, y: 20 },
      startDelta: { x: 1, y: 2 },
      prevDelta: { x: 1, y: 2 },
      target: sensor,
    });

    expect(userResource.getState()).toEqual(ModelState.FIXED);

    sensor.pointUp.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      type: g.EventType.PointUp,
      pointerId: 6,
      point: { x: 10, y: 20 },
      startDelta: { x: 1, y: 2 },
      prevDelta: { x: 1, y: 2 },
      target: sensor,
    });

    expect(userResource.getState()).toEqual(ModelState.FIXED);
  });
});
