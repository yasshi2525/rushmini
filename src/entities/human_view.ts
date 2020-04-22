import { ViewerCreator } from "./factory";
import Human from "../models/human";

const width = 3;
const height = 8;
const cssColor = "#33ff66";

const createHumanPanel: ViewerCreator<Human> = (
  loadedScene: g.Scene,
  h: Human
) => {
  const panel = new g.E({
    scene: loadedScene,
    x: h._getVector().x - width / 2,
    y: h._getVector().y - height / 2,
  });

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
