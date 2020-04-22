import { ViewerCreator } from "./factory";
import Company from "../models/company";

const width = 10;
const height = 10;
const cssColor = "#2266ff";

const createResidencePanel: ViewerCreator<Company> = (
  loadedScene: g.Scene,
  r: Company
) => {
  const panel = new g.E({
    scene: loadedScene,
    x: r.x - width / 2,
    y: r.y - height / 2,
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
