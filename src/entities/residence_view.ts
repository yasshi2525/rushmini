import Residence from "../models/residence";
import { ViewerCreator } from "./factory";

const width = 10;
const height = 10;
const cssColor = "#ff6622";

const createResidencePanel: ViewerCreator<Residence> = (
  loadedScene: g.Scene,
  r: Residence
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
