import scorer from "../utils/scorer";

const toText = (score: number) => `SCORE: ${score}`;

const createScoreLabel = (loadedScene: g.Scene) => {
  const panel = new g.E({ scene: loadedScene });

  const label = new g.SystemLabel({
    scene: loadedScene,
    x: g.game.width - 150,
    y: 50,
    fontSize: 15,
    text: toText(scorer.get()),
  });

  // 得点が変化したならラベルテキストを更新する
  scorer.observe(() => {
    label.text = toText(scorer.get());
    label.modified();
  });

  panel.append(label);

  return panel;
};

export default createScoreLabel;
