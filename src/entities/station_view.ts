import Station from "../models/station";
import { ViewerCreator } from "./factory";
import createPointableView from "./point_view";

const width = 30;
const height = 30;
const cssColor = "#112233";

const createStationPanel: ViewerCreator<Station> = (
  loadedScene: g.Scene,
  st: Station
) => {
  const panel = createPointableView(loadedScene, st, width, height);
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

export default createStationPanel;
