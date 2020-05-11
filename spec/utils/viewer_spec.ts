import preserveEntityCreator from "entities/loader";
import random from "utils/random";
import scorer from "utils/scorer";
import viewer, { ViewerType } from "utils/viewer";

import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => Promise<void>;

describe("controller", () => {
  let scene: g.Scene;

  beforeEach(async () => {
    random.init(new g.XorshiftRandomGenerator(0));
    scorer.init({ score: 0 });
    scene = await createLoadedScene(true);
    preserveEntityCreator();
  });

  afterEach(async () => {
    recreateGame();
  });

  it("init creates panels", () => {
    viewer.init(scene);
    Object.keys(ViewerType)
      .map((key) => parseInt(key, 10))
      .filter((key) => !isNaN(key))
      .forEach((key: ViewerType) => {
        expect(viewer.viewers[key]).not.toBeUndefined();
      });
  });
});
