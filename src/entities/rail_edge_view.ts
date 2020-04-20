import RailEdge from "../models/rail_edge";
import { ViewerCreator } from "./factory";

const width = 5;
const cssColor = "#000000";

const createRailEdgePanel: ViewerCreator<RailEdge> = (
  loadedScene: g.Scene,
  re: RailEdge
) => {
  const panel = new g.E({ scene: loadedScene });

  panel.append(
    new g.FilledRect({
      scene: loadedScene,
      x: (re.from.x + re.to.x - width) / 2,
      y: (re.from.y + re.to.y - width) / 2,
      width: re.vector.length,
      height: width,
      cssColor,
      anchorX: 0.5,
      anchorY: 0.5,
      angle: re.vector.angleDegree,
    })
  );

  return panel;
};

export default createRailEdgePanel;
