import RailEdge from "../models/rail_edge";
import creators from "./creator";

const width = 5;
const cssColor = "#aaaaaa";

creators.put(
  RailEdge,
  (scene, re) =>
    new g.FilledRect({
      scene,
      width: re.arrow.length() + width / 2,
      height: width,
      cssColor,
      angle: re.arrow.angleDegree(),
    })
);
