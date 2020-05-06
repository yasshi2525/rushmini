import { createFramedRect } from "./rectangle";

const WIDTH = 0.6;
const HEIGHT = 300;
const COLOR = "#f0f8ff";
const BORDER = 8;

const createBonusPanel = (loadedScene: g.Scene) => {
  const panel = createFramedRect(
    loadedScene,
    g.game.width * WIDTH - BORDER / 2,
    HEIGHT,
    COLOR,
    BORDER
  );
  panel.x = (g.game.width * (1 - WIDTH)) / 2;
  panel.y = (g.game.height - HEIGHT) / 2;
  panel.modified();
  panel.append(
    new g.SystemLabel({
      x: panel.width / 2,
      y: 50,
      scene: loadedScene,
      fontSize: 30,
      text: "ボーナスを1つ選んでください",
      textAlign: g.TextAlign.Center,
    })
  );
  panel.hide();
  return panel;
};

export default createBonusPanel;
