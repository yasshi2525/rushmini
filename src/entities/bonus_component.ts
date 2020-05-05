import { createFramedRect } from "./rectangle";

const PARENT_RATIO = 0.8;
const OFFSET_Y = 100;
const SIZE = 100;
const BORDER_WIDTH = 8;
const ENABLED_COLOR = "#3cb371";
const DISABLED_COLOR = "#888888";

const createBonusComponent = (
  loadedScene: g.Scene,
  label: string,
  index: number,
  cb: () => void
) => {
  const panel = createFramedRect(
    loadedScene,
    SIZE - BORDER_WIDTH,
    SIZE - BORDER_WIDTH,
    ENABLED_COLOR,
    BORDER_WIDTH
  );
  panel.touchable = true;
  panel.x = (g.game.width * PARENT_RATIO - (SIZE * 4 + BORDER_WIDTH * 5)) / 2;
  panel.y = OFFSET_Y;
  panel.modified();
  panel.pointDown.add(() => {
    (panel.children[0] as g.FilledRect).cssColor = DISABLED_COLOR;
    panel.touchable = false;
    panel.modified();
    cb();
  });
  panel.append(
    new g.SystemLabel({
      x: SIZE / 2,
      y: SIZE / 4,
      scene: loadedScene,
      fontSize: SIZE / 5,
      text: label,
      textAlign: g.TextAlign.Center,
    })
  );
  return panel;
};

export default createBonusComponent;
