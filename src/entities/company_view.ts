import Company from "../models/company";
import { ViewerCreator } from "./factory";

const width = 10;
const height = 10;
const cssColor = "#2266ff";

const createResidencePanel: ViewerCreator<Company> = (
  loadedScene: g.Scene,
  c: Company
) => {
  const panel = new g.E({
    scene: loadedScene,
    x: c.x - width / 2,
    y: c.y - height / 2,
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

export default createResidencePanel;
