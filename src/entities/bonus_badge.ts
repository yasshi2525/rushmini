import viewer, { ViewerEvent } from "../utils/viewer";
import { createSquareSprite } from "./sprite";

const MARGIN_RATE = 0.1;

const createBonusBadge = (loadedScene: g.Scene) => {
  const container = new g.E({ scene: loadedScene });

  const icon = createSquareSprite(loadedScene, "bonus_icon");
  icon.x = g.game.width * (1 - MARGIN_RATE) - icon.width * 2;
  icon.y = g.game.height * MARGIN_RATE;
  icon.touchable = true;
  icon.hide();
  icon.modified();
  container.append(icon);

  const minimize = createSquareSprite(loadedScene, "minimize_img");
  minimize.x = icon.x;
  minimize.y = icon.y;
  minimize.touchable = true;
  minimize.modified();
  container.append(minimize);

  icon.pointUp.add(() => {
    icon.hide();
    minimize.show();
    viewer.fire(ViewerEvent.BONUS_REACTIVED);
  });

  minimize.pointUp.add(() => {
    minimize.hide();
    icon.show();
    viewer.fire(ViewerEvent.BONUS_MINIMIZED);
  });

  container.hide();
  return container;
};

export default createBonusBadge;
