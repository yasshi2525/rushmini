import EdgeTask from "../models/edge_task";
import RailEdge from "../models/rail_edge";
import Train from "../models/train";
import creators from "./creator";
import { ViewObject } from "./factory";
import { createSquareSprite } from "./sprite";

const SLIDE = 20;

const edge = (t: Train) => {
  const lt = t.current()._base();
  const e = lt.isDeptTask() ? lt.next : lt;
  if (e.isDeptTask()) {
    return undefined;
  }
  return (e as EdgeTask).edge;
};

const getX = (re: RailEdge) =>
  re ? SLIDE * Math.cos(re.arrow.angle() + Math.PI / 2) : 0;
const getY = (re: RailEdge) =>
  re ? SLIDE * Math.sin(re.arrow.angle() + Math.PI / 2) : 0;
const getAngle = (re: RailEdge) => {
  if (re) {
    let angle = re.arrow.angleDegree();
    if (angle > 90) {
      angle = 180 + angle;
    } else if (angle < -90) {
      angle = 180 + angle;
    }
    return angle;
  }
  return 0;
};

export const trainModifer = (vo: ViewObject<Train>) => {
  const sprite = vo.viewer.children[0];
  const t = vo.subject;
  sprite.x = getX(edge(t));
  sprite.y = getY(edge(t));
  sprite.angle = getAngle(edge(t));

  sprite.modified();
};

creators.put(Train, (scene, t) => {
  const sprite = createSquareSprite(scene, "train_basic");
  sprite.x = getX(edge(t));
  sprite.y = getY(edge(t));
  sprite.angle = getAngle(edge(t));
  sprite.modified();
  return sprite;
});
