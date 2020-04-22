import Station from "../models/station";
import { ViewerCreator } from "./factory";

const width = 30;
const height = 30;
const cssColor = "#112233";

const createStationPanel: ViewerCreator<Station> = (
  loadedScene: g.Scene,
  st: Station
) => {
  const pos = st.getPos();
  const panel = new g.E({
    scene: loadedScene,
    x: pos.x - width / 2,
    y: pos.y - height / 2,
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

export default createStationPanel;
