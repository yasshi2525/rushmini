import viewer, { ViewerEvent } from "../utils/viewer";
import { createFramedRect } from "./rectangle";

const OFFSET_X = 20;
const OFFSET_Y = 100;
const SIZE = 100;
const BORDER_WIDTH = 8;
const ENABLED_COLOR = "#3cb371";
const DISABLED_COLOR = "#888888";

const createPanel = (scene: g.Scene, index: number) => {
  const panel = createFramedRect(
    scene,
    SIZE - BORDER_WIDTH,
    SIZE - BORDER_WIDTH,
    ENABLED_COLOR,
    BORDER_WIDTH
  );
  panel.touchable = true;
  panel.x = OFFSET_X + (SIZE + BORDER_WIDTH) * index;
  panel.y = OFFSET_Y;
  panel.modified();
  return panel;
};

const createInstruction = (scene: g.Scene, label: string) =>
  new g.SystemLabel({
    x: SIZE / 2,
    y: SIZE / 4,
    scene,
    fontSize: SIZE / 5,
    text: label,
    textAlign: g.TextAlign.Center,
  });

const createBonusComponent = (
  loadedScene: g.Scene,
  label: string,
  index: number,
  onSelected: ViewerEvent
) => {
  const panel = createPanel(loadedScene, index);
  panel.pointUp.add(() => {
    (panel.children[0] as g.FilledRect).cssColor = DISABLED_COLOR;
    panel.touchable = false;
    panel.modified();
    viewer.fire(onSelected);
  });
  panel.append(createInstruction(loadedScene, label));
  return panel;
};

export default createBonusComponent;
