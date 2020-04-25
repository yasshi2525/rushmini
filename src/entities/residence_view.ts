import Residence from "../models/residence";
import { ViewerCreator } from "./factory";
import createPointableView from "./point_view";

const width = 10;
const height = 10;
const cssColor = "#ff6622";

const createResidencePanel: ViewerCreator<Residence> = (
  loadedScene: g.Scene,
  r: Residence
) => {
  const panel = createPointableView(loadedScene, r, width, height);

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
