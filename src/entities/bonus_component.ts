import viewer, { ViewerEvent } from "../utils/viewer";
import { createSquareSprite } from "./sprite";

const SIZE = 128;
const OFFSET_Y = 50;
const RATIO = 0.7;

const createBonusComponent = (
  loadedScene: g.Scene,
  key: string,
  index: number,
  onSelected: ViewerEvent
) => {
  const panel = new g.E({
    scene: loadedScene,
    x: (g.game.width * RATIO) / 2 + SIZE * (index - 2),
    y: OFFSET_Y,
  });
  const disabled = createSquareSprite(loadedScene, key + "_bonus_disabled");
  panel.append(disabled);
  const enabled = createSquareSprite(loadedScene, key + "_bonus_enabled");
  enabled.touchable = true;
  enabled.modified();
  enabled.pointUp.add(() => {
    viewer.fire(onSelected);
    enabled.hide();
  });
  panel.append(enabled);
  return panel;
};

export default createBonusComponent;
