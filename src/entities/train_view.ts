import Train from "../models/train";
import { ViewerCreator } from "./factory";
import createPointableView from "./point_view";

const width = 40;
const height = 8;
const cssColor = "#008833";

const createTrainPanel: ViewerCreator<Train> = (
  loadedScene: g.Scene,
  t: Train
) => {
  const panel = createPointableView(loadedScene, t, width, height);

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

export default createTrainPanel;
