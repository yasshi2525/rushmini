import controller from "entities/controller";
import modelListener from "models/listener";
import userResource from "models/user_resource";
import random from "utils/random";
import routeFinder from "utils/route_finder";
import scorer from "utils/scorer";
import transportFinder from "utils/transport_finder";
import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => Promise<void>;

const scoreBorders = [1000, 2000, 4000, 8000];

beforeEach(() => {
  random.init(new g.XorshiftRandomGenerator(0));
});

describe("bonus_branch", () => {
  let scene: g.Scene;

  beforeEach(async () => {
    scorer.init({ score: 0 });
    scene = await createLoadedScene(true);
    controller.init(scene);
  });

  afterEach(async () => {
    controller.reset();
    userResource.reset();
    routeFinder.reset();
    transportFinder.reset();
    modelListener.flush();
    modelListener.unregisterAll();
    scorer.reset();
    await recreateGame();
  });

  it("button can be pushed after bonus panel is opened", () => {
    const panel = controller.bonusPanel;
    const branch = controller.bonusBranch;

    expect(panel.visible()).toBeFalsy();

    scorer.add(scoreBorders[0]);
    expect(panel.visible()).toBeTruthy();
    expect(branch.visible()).toBeTruthy();
  });

  it("bonus panel is hidden after button is pushed", () => {
    const panel = controller.bonusPanel;
    const branch = controller.bonusBranch;

    scorer.add(scoreBorders[0]);
    branch.pointUp.fire();

    expect(panel.visible()).toBeFalsy();
  });

  it("viewer mask is enabled after click bonus panel", () => {
    const branch = controller.bonusBranch;
    const mask = controller.mask;

    expect(mask.visible()).toBeFalsy();

    scorer.add(scoreBorders[0]);

    expect(mask.visible()).toBeTruthy();

    branch.pointUp.fire();

    expect(mask.visible()).toBeTruthy();
  });

  it("candidate station is enabled after click bonus panel", () => {
    const branch = controller.bonusBranch;
    const candidate = controller.branch_builder;

    userResource.start(0, 0);
    userResource.extend(50, 50);
    userResource.end();

    expect(candidate.visible()).toBeFalsy();

    scorer.add(scoreBorders[0]);
    expect(candidate.visible()).toBeFalsy();

    branch.pointUp.fire();
    expect(candidate.visible()).toBeTruthy();

    expect(candidate.children[0].children.length).toEqual(2);
  });

  it("mask is hidden after candidate station is clicked", () => {
    const branch = controller.bonusBranch;
    const candidate = controller.branch_builder;
    const mask = controller.mask;
    userResource.start(0, 0);
    userResource.extend(50, 50);
    userResource.end();
    scorer.add(scoreBorders[0]);
    branch.pointUp.fire();
    candidate.pointDown.fire({
      local: undefined,
      player: { id: "dummyPlayerID" },
      point: { x: 2, y: 2 },
      priority: 2,
      pointerId: 1,
      target: candidate,
      type: g.EventType.PointDown,
    });
    expect(mask.visible()).toBeFalsy();
  });

  it("isBonusing is false after station is branched", () => {
    const branch = controller.bonusBranch;
    const candidate = controller.branch_builder;
    const mask = controller.mask;

    userResource.start(0, 0);
    userResource.extend(50, 50);
    userResource.end();

    expect(controller.isBonusing).toBeFalsy();

    scorer.add(scoreBorders[0]);

    expect(controller.isBonusing).toBeTruthy();

    branch.pointUp.fire();

    expect(controller.isBonusing).toBeTruthy();

    candidate.pointDown.fire({
      local: undefined,
      player: { id: "dummyPlayerID" },
      point: { x: 2, y: 2 },
      priority: 2,
      pointerId: 1,
      target: candidate,
      type: g.EventType.PointDown,
    });

    expect(controller.isBonusing).toBeTruthy();

    candidate.pointMove.fire({
      local: undefined,
      player: { id: "dummyPlayerID" },
      point: { x: 2, y: 2 },
      prevDelta: { x: 0, y: 0 },
      startDelta: { x: 0, y: 0 },
      priority: 2,
      pointerId: 1,
      target: candidate,
      type: g.EventType.PointDown,
    });

    expect(controller.isBonusing).toBeTruthy();

    candidate.pointUp.fire();

    expect(controller.isBonusing).toBeFalsy();
  });
});
