import createScoreLabel from "entities/score";
import scorer from "utils/scorer";
import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => void;
const toText = (score: number) => `SCORE: ${score}`;

describe("score", () => {
  let scene: g.Scene;
  beforeEach(async () => {
    scene = await createLoadedScene(g.game);
    scorer.init({ score: 0 });
  });

  afterEach(() => {
    recreateGame();
  });

  it("observe", () => {
    const panel = createScoreLabel(scene);
    const label = panel.children[0];
    expect(label).toBeInstanceOf(g.SystemLabel);
    expect((label as g.SystemLabel).text).toEqual(toText(0));

    scorer.add(100);
    expect((label as g.SystemLabel).text).toEqual(toText(100));
  });
});
