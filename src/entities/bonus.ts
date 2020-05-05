import scorer, { ScoreListener } from "../utils/scorer";
import { createFramedRect } from "./rectangle";

const borders = [1000, 2000, 4000, 8000];
const WIDTH = 0.6;
const HEIGHT = 300;
const COLOR = "#f0f8ff";
const BORDER = 8;

const createScoreHandler = (
  panel: g.E,
  onOpened: () => void,
  isActive: () => boolean
): ScoreListener => {
  const bs = [...borders];
  return (num: number) => {
    if (bs.length > 0 && num >= bs[0] && !isActive()) {
      panel.show();
      onOpened();
      bs.shift();
    }
  };
};

const createBonusPanel = (
  loadedScene: g.Scene,
  onOpened: () => void,
  isActive: () => boolean
) => {
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
  scorer.observe(createScoreHandler(panel, onOpened, isActive));
  return panel;
};

export default createBonusPanel;
