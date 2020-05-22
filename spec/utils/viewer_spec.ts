import creators from "entities/creator";
import preserveEntityCreator from "entities/loader";
import random from "utils/random";
import scorer from "utils/scorer";
import viewer, { ViewerType } from "utils/viewer";

import { createLoadedScene } from "../_helper/scene";

describe("controller", () => {
  let scene: g.Scene;

  beforeEach(async () => {
    random.init(new g.XorshiftRandomGenerator(0));
    scorer.init({ score: 0 });
    scene = await createLoadedScene();
    creators.init();
    preserveEntityCreator();
  });

  afterEach(() => {
    creators.reset();
    g.game.popScene();
    g.game.tick(false);
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
