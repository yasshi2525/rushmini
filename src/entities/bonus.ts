import { createFramedRect } from "./rectangle";
import { createSquareSprite } from "./sprite";

const WIDTH = 0.7;
const HEIGHT = 200;
const COLOR = "#f0f8ff";

const createBonusPanel = (loadedScene: g.Scene) => {
  const panel = new g.E({ scene: loadedScene });
  panel.x = (g.game.width * (1 - WIDTH)) / 2;
  panel.y = (g.game.height - HEIGHT) / 2;
  panel.modified();
  const bg = new g.FilledRect({
    scene: loadedScene,
    width: g.game.width * WIDTH,
    height: HEIGHT,
    cssColor: COLOR,
    opacity: 0.5,
  });
  panel.append(bg);
  const guide = createSquareSprite(loadedScene, "bonus_txt");
  guide.x = (bg.width - guide.width) / 2;
  guide.modified();
  panel.append(guide);
  panel.hide();
  return panel;
};

export default createBonusPanel;
