import viewer, { ViewerEvent } from "../utils/viewer";
import { createSquareSprite } from "./sprite";

const MARGIN_RATE = 0.1;

const createUndoButton = (loadedScene: g.Scene) => {
  const icon = createSquareSprite(loadedScene, "undo_img");
  icon.x = g.game.width * (1 - MARGIN_RATE) - icon.width * 2;
  icon.y = g.game.height * MARGIN_RATE;
  icon.touchable = true;
  icon.hide();
  icon.modified();

  icon.pointUp.add(() => {
    icon.hide();
    viewer.fire(ViewerEvent.BONUS_UNDONE);
  });

  return icon;
};

export default createUndoButton;
