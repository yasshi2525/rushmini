import scorer from "../utils/scorer";
import createFont from "./font";

const toText = (score: number) => `SCORE:${("      " + score).slice(-6)}`;

const createScoreLabel = (loadedScene: g.Scene) => {
  const panel = new g.E({ scene: loadedScene });

  const label = new g.Label({
    scene: loadedScene,
    x: g.game.width - 350,
    y: 15,
    fontSize: 28,
    text: toText(scorer.get()),
    font: createFont("score_main"),
  });

  // 得点が変化したならラベルテキストを更新する
  scorer.register(() => {
    label.text = toText(scorer.get());
    label.invalidate();
  });

  panel.append(label);

  return panel;
};

export default createScoreLabel;
