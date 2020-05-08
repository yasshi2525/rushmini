import ticker, { EventType } from "../utils/ticker";

const toText = (sec: number) => `TIME: ${("000" + sec).slice(-3)}`;

const createTickLabel = (loadedScene: g.Scene) => {
  const panel = new g.E({ scene: loadedScene });

  const label = new g.SystemLabel({
    scene: loadedScene,
    text: toText(ticker.getRemainGameTime()),
    fontSize: 15,
    x: g.game.width - 150,
    y: 30,
  });

  // 残り時間が変化したならラベルテキストを更新する
  ticker.triggers.find(EventType.SECOND).register((sec: number) => {
    label.text = toText(ticker.getRemainGameTime());
    label.modified();
  });

  panel.append(label);

  return panel;
};

export default createTickLabel;
