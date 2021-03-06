import createScoreLabel from "entities/score";
import scorer from "utils/scorer";

import { createLoadedScene } from "../_helper/scene";

describe("score", () => {
  let scene: g.Scene;
  let panel: g.E;

  beforeEach(async () => {
    scorer.init({ score: 0 });
    scene = await createLoadedScene();
    panel = createScoreLabel(scene);
  });

  afterEach(() => {
    g.game.popScene();
    g.game.tick(false);
  });

  it("observe", () => {
    const label = panel.children[0];
    expect(label).toBeInstanceOf(g.Label);
    expect((label as g.Label).text).toEqual("SCORE:     0");

    scorer.add(100);
    expect((label as g.Label).text).toEqual("SCORE:   100");
  });
});
