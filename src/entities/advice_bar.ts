import scenes from "../utils/scene";
import { createSquareSprite } from "./sprite";

const COLOR = "#ff7f50";
const ALPHA = 0.5;

const createAdviceBar = (loadedScene: g.Scene) => {
  const container = new g.E({ scene: loadedScene });

  const bg = new g.FilledRect({
    scene: loadedScene,
    y: 15,
    width: 300,
    height: 65,
    cssColor: COLOR,
    opacity: ALPHA,
  });
  container.append(bg);

  const mark = createSquareSprite(loadedScene, "advice_mode_basic");
  container.append(mark);

  const txt = createSquareSprite(loadedScene, "advice_txt");
  txt.x = 95;
  txt.y = 22;
  txt.modified();
  container.append(txt);

  const off = createSquareSprite(loadedScene, "advice_off_img");
  off.x = 200;
  off.y = 5;
  off.touchable = true;
  if (scenes.isAdvice) off.hide();
  off.modified();
  container.append(off);

  const on = createSquareSprite(loadedScene, "advice_on_img");
  on.x = 200;
  on.y = 5;
  on.touchable = true;
  if (!scenes.isAdvice) on.hide();
  on.modified();
  container.append(on);

  off.pointUp.add(() => {
    off.hide();
    on.show();
    scenes.isAdvice = true;
  });

  on.pointUp.add(() => {
    off.show();
    on.hide();
    scenes.isAdvice = false;
  });

  container.x = 250;
  container.y = g.game.height * 0.9 - mark.height;
  container.modified();

  return container;
};

export default createAdviceBar;
