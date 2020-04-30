import Human from "../models/human";
import { ViewerCreator } from "./factory";
import createPointableView from "./point_view";

const width = 3;
const height = 8;
const cssColor = "#33ff66";

const createHumanPanel: ViewerCreator<Human> = (
  loadedScene: g.Scene,
  h: Human
) => {
  const panel = createPointableView(loadedScene, h, width, height);

  panel.append(
    new g.FilledRect({
      scene: loadedScene,
      width,
      height,
      cssColor,
    })
  );

  return panel;
};

export default createHumanPanel;