import ticker, { EventType } from "../utils/ticker";
import createFont from "./font";

const toText = (sec: number) => `TIME:${("   " + sec).slice(-3)}`;

const createTickLabel = (loadedScene: g.Scene) => {
  const panel = new g.E({ scene: loadedScene });

  const label = new g.Label({
    scene: loadedScene,
    text: toText(ticker.getRemainGameTime()),
    fontSize: 28,
    x: 75,
    y: 15,
    font: createFont("score_main"),
  });

  // 残り時間が変化したならラベルテキストを更新する
  ticker.triggers.find(EventType.SECOND).register((sec: number) => {
    label.text = toText(ticker.getRemainGameTime());
    label.invalidate();
  });

  panel.append(label);

  return panel;
};

export default createTickLabel;
