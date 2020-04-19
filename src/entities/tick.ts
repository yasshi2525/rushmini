import ticker from "../utils/ticker";

const toText = (sec: number) => `TIME: ${("00" + sec).slice(-2)}`;

const createTickLabel = (loadedScene: g.Scene) => {
  const panel = new g.E({ scene: loadedScene });

  const label = new g.SystemLabel({
    scene: loadedScene,
    text: toText(ticker.getRemainGameTime()),
    fontSize: 15,
    x: g.game.width - 100,
    y: 30,
  });

  // 残り時間が変化したならラベルテキストを更新する
  ticker.observe((sec: number) => {
    label.text = toText(ticker.getRemainGameTime());
    label.modified();
  });

  panel.append(label);

  return panel;
};

export default createTickLabel;
