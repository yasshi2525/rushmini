import RailEdge from "../models/rail_edge";
import creators from "./creator";

const width = 5;
const cssColor = "#aaaaaa";

creators.put(RailEdge, (scene, re) => {
  const rect = new g.FilledRect({
    scene,
    width: re.arrow.length() + width / 2,
    height: width,
    cssColor,
    angle: re.arrow.angleDegree(),
  });
  rect.x -= rect.width / 2;
  rect.y -= rect.height / 2;
  rect.modified();
  return rect;
});
