import RailEdge from "../models/rail_edge";
import { ViewerCreator } from "./factory";

const width = 5;
const cssColor = "#000000";

const createRailEdgePanel: ViewerCreator<RailEdge> = (
  loadedScene: g.Scene,
  re: RailEdge
) => {
  const panel = new g.E({
    scene: loadedScene,
    x: re.loc().x - width / 2,
    y: re.loc().y - width / 2,
  });

  panel.append(
    new g.FilledRect({
      scene: loadedScene,
      width: re.arrow.length(),
      height: width,
      cssColor,
      anchorX: 0.5,
      anchorY: 0.5,
      angle: re.arrow.angleDegree(),
    })
  );

  return panel;
};

export default createRailEdgePanel;
