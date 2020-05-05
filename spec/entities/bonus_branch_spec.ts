import controller from "entities/controller";
import modelListener from "models/listener";
import random from "utils/random";
import scorer from "utils/scorer";
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
    scorer.reset();
    modelListener.flush();
    modelListener.unregisterAll();
    await recreateGame();
  });

  it("cursor is enabled after click bonus panel", () => {
    const panel = controller.bonusPanel;
    const branch = controller.bonusBranch;
    const cursor = controller.cursor;

    expect(panel.visible()).toBeFalsy();
    expect(cursor.visible()).toBeTruthy();

    scorer.add(scoreBorders[0]);

    expect(panel.visible()).toBeTruthy();
    expect(branch.visible()).toBeTruthy();
    expect(cursor.visible()).toBeFalsy();

    branch.pointDown.fire({
      type: g.EventType.PointDown,
      point: { x: 0, y: 0 },
      priority: 2,
      local: true,
      target: branch,
      pointerId: 1,
      player: { id: "dummy" },
    });

    expect(panel.visible()).toBeFalsy();
    expect(cursor.visible()).toBeTruthy();
  });
});
