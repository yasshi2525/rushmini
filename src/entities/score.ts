import scorer from "../utils/scorer";

const toText = (score: number) => `SCORE: ${("000" + score).slice(-3)}`;

const createScoreLabel = (loadedScene: g.Scene) => {
  const panel = new g.E({ scene: loadedScene });

  const label = new g.SystemLabel({
    scene: loadedScene,
    x: g.game.width - 100,
    y: 60,
    fontSize: 15,
    text: toText(scorer.get()),
  });

  // 得点が変化したならラベルテキストを更新する
  scorer.observe((num) => {
    label.text = toText(scorer.get());
    label.modified();
  });

  panel.append(label);

  return panel;
};

export default createScoreLabel;
