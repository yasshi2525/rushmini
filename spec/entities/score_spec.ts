import createScoreLabel from "entities/score";
import scorer from "utils/scorer";

import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => Promise<void>;
const toText = (score: number) => `SCORE: ${score}`;

describe("score", () => {
  let scene: g.Scene;
  let panel: g.E;

  beforeEach(async () => {
    scorer.init({ score: 0 });
    scene = await createLoadedScene();
    panel = createScoreLabel(scene);
  });

  afterEach(async () => {
    await recreateGame();
  });

  it("observe", () => {
    const label = panel.children[0];
    expect(label).toBeInstanceOf(g.SystemLabel);
    expect((label as g.SystemLabel).text).toEqual(toText(0));

    scorer.add(100);
    expect((label as g.SystemLabel).text).toEqual(toText(100));
  });
});
