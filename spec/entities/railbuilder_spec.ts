import { createLoadedScene } from "../_helper/scene";
import createRailBuilder from "entities/railbuilder";
import model, { ModelStateType } from "models";
import DeptTask from "models/dept_task";
import EdgeTask from "models/edge_task";

declare const recreateGame: () => void;

describe("railbuilder", () => {
  let scene: g.Scene;

  beforeEach(async () => {
    scene = await createLoadedScene(g.game);
  });

  afterEach(() => {
    model.reset();
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
    const dept = model.primaryLine.top;
    expect(dept).toBeInstanceOf(DeptTask);
    expect(dept._getDept().x).toEqual(10);
    expect(dept._getDept().y).toEqual(20);
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
    const dept = model.primaryLine.top;
    expect(dept).toBeInstanceOf(DeptTask);
    expect(dept._getDept().x).toEqual(10);
    expect(dept._getDept().y).toEqual(20);

    const outbound = dept.next;
    expect(outbound).toBeInstanceOf(EdgeTask);
    expect(outbound._getDept().x).toEqual(10);
    expect(outbound._getDept().y).toEqual(20);
    expect(outbound._getDest().x).toEqual(11);
    expect(outbound._getDest().y).toEqual(22);

    const inbound = outbound.next;
    expect(inbound).toBeInstanceOf(EdgeTask);
    expect(inbound._getDept().x).toEqual(11);
    expect(inbound._getDept().y).toEqual(22);
    expect(inbound._getDest().x).toEqual(10);
    expect(inbound._getDest().y).toEqual(20);

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
    const dept1 = model.primaryLine.top;
    expect(dept1).toBeInstanceOf(DeptTask);
    expect(dept1._getDept().x).toEqual(10);
    expect(dept1._getDept().y).toEqual(20);

    const outbound = dept1.next;
    expect(outbound).toBeInstanceOf(EdgeTask);
    expect(outbound._getDept().x).toEqual(10);
    expect(outbound._getDept().y).toEqual(20);
    expect(outbound._getDest().x).toEqual(11);
    expect(outbound._getDest().y).toEqual(22);

    const dept2 = outbound.next;
    expect(dept2).toBeInstanceOf(DeptTask);
    expect(dept2._getDept().x).toEqual(11);
    expect(dept2._getDept().y).toEqual(22);

    const inbound = dept2.next;
    expect(inbound).toBeInstanceOf(EdgeTask);
    expect(inbound._getDept().x).toEqual(11);
    expect(inbound._getDept().y).toEqual(22);
    expect(inbound._getDest().x).toEqual(10);
    expect(inbound._getDest().y).toEqual(20);

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

    expect(model.getState()).toEqual(ModelStateType.FIXED);

    sensor.pointDown.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      point: { x: 10, y: 20 },
      type: g.EventType.PointDown,
      pointerId: 4,
      target: panel,
    });

    expect(model.getState()).toEqual(ModelStateType.FIXED);

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

    expect(model.getState()).toEqual(ModelStateType.FIXED);

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

    expect(model.getState()).toEqual(ModelStateType.FIXED);
  });
});
