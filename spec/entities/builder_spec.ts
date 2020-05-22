import creators from "entities/creator";
import preserveEntityCreator from "entities/loader";
import cityResource from "models/city_resource";
import DeptTask from "models/dept_task";
import EdgeTask from "models/edge_task";
import modelListener from "models/listener";
import userResource, { ModelState } from "models/user_resource";
import random from "utils/random";
import routeFinder from "utils/route_finder";
import scorer from "utils/scorer";
import transportFinder from "utils/transport_finder";
import viewer, { ViewerType } from "utils/viewer";

import { createLoadedScene } from "../_helper/scene";

beforeAll(() => {
  random.init(new g.XorshiftRandomGenerator(0));
});

describe("railbuilder", () => {
  let scene: g.Scene;
  let panel: g.E;

  beforeEach(async () => {
    scorer.init({ score: 0 });
    scene = await createLoadedScene();
    creators.init();
    preserveEntityCreator();
    viewer.init(scene);
    panel = viewer.viewers[ViewerType.BUILDER];
  });

  afterEach(() => {
    viewer.reset();
    creators.reset();
    transportFinder.reset();
    routeFinder.reset();
    userResource.reset();
    cityResource.reset();
    modelListener.flush();
    modelListener.unregisterAll();
    g.game.popScene();
    g.game.tick(false);
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
    g.game.tick(false);
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
      pointerId: 1,
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
    g.game.tick(false);
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
      pointerId: 1,
      point: { x: 10, y: 20 },
      startDelta: { x: 100, y: 200 },
      prevDelta: { x: 100, y: 200 },
      target: panel,
    });
    panel.pointUp.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      type: g.EventType.PointUp,
      pointerId: 1,
      point: { x: 10, y: 20 },
      startDelta: { x: 100, y: 200 },
      prevDelta: { x: 0, y: 0 },
      target: panel,
    });
    const dept1 = userResource.getPrimaryLine().top;
    expect(dept1).toBeInstanceOf(DeptTask);
    expect(dept1.departure().loc()).toEqual({ x: 10, y: 20 });

    const outbound = dept1.next;
    expect(outbound).toBeInstanceOf(EdgeTask);
    expect(outbound.departure().loc()).toEqual({ x: 10, y: 20 });
    expect(outbound.destination().loc()).toEqual({ x: 110, y: 220 });

    const dept2 = outbound.next;
    expect(dept2).toBeInstanceOf(DeptTask);
    expect(dept2.departure().loc()).toEqual({ x: 110, y: 220 });

    const inbound = dept2.next;
    expect(inbound).toBeInstanceOf(EdgeTask);
    expect(inbound.departure().loc()).toEqual({ x: 110, y: 220 });
    expect(inbound.destination().loc()).toEqual({ x: 10, y: 20 });

    expect(inbound.next).toEqual(dept1);

    expect(panel.visible()).toBeFalsy();
    g.game.tick(false);
  });

  it("rollback unused line", () => {
    panel.pointDown.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      point: { x: -100, y: -100 },
      type: g.EventType.PointDown,
      pointerId: 1,
      target: panel,
    });
    panel.pointMove.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      type: g.EventType.PointMove,
      pointerId: 1,
      point: { x: -100, y: -100 },
      startDelta: { x: -200, y: 0 },
      prevDelta: { x: -200, y: 0 },
      target: panel,
    });
    panel.pointUp.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      type: g.EventType.PointUp,
      pointerId: 1,
      point: { x: 0, y: 1000 },
      startDelta: { x: -200, y: 0 },
      prevDelta: { x: -200, y: 0 },
      target: panel,
    });
    expect(userResource.getState()).toEqual(ModelState.INITED);
    g.game.tick(false);
  });

  it("forbit multitouch", () => {
    panel.pointDown.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      point: { x: 0, y: 0 },
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
      point: { x: 0, y: 0 },
      startDelta: { x: 0, y: 100 },
      prevDelta: { x: 0, y: 100 },
      target: panel,
    });
    expect(userResource.getState()).toEqual(ModelState.STARTED);
    panel.pointUp.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      type: g.EventType.PointUp,
      pointerId: 2,
      point: { x: 0, y: 0 },
      startDelta: { x: 0, y: 100 },
      prevDelta: { x: 0, y: 0 },
      target: panel,
    });
    expect(userResource.getState()).toEqual(ModelState.STARTED);
    panel.pointDown.fire({
      priority: 2,
      local: true,
      player: { id: "1" },
      point: { x: 0, y: 0 },
      type: g.EventType.PointDown,
      pointerId: 2,
      target: panel,
    });
    expect(userResource.getState()).toEqual(ModelState.STARTED);
    g.game.tick(false);
  });
});
