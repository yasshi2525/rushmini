import createScoreLabel from "entities/score";
import scorer from "utils/scorer";

import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => Promise<void>;

describe("score", () => {
  let scene: g.Scene;
  let panel: g.E;

  beforeEach(async () => {
    scorer.init({ score: 0 });
    scene = await createLoadedScene(true);
    panel = createScoreLabel(scene);
  });

  afterEach(async () => {
    await recreateGame();
  });

  it("observe", () => {
    const label = panel.children[0];
    expect(label).toBeInstanceOf(g.Label);
    expect((label as g.Label).text).toEqual("SCORE:     0");

    scorer.add(100);
    expect((label as g.Label).text).toEqual("SCORE:   100");
  });
});
