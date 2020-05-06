import controller from "entities/controller";
import random from "utils/random";
import scorer from "utils/scorer";
import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => Promise<void>;

describe("controller", () => {
  let scene: g.Scene;

  beforeEach(async () => {
    random.init(new g.XorshiftRandomGenerator(0));
    scorer.init({ score: 0 });
    scene = await createLoadedScene(true);
  });

  afterEach(async () => {
    recreateGame();
  });

  it("init", () => {
    controller.init(scene);
  });
});
