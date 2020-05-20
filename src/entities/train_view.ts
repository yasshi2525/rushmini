import EdgeTask from "../models/edge_task";
import RailEdge from "../models/rail_edge";
import Train from "../models/train";
import creators from "./creator";
import { ViewObject } from "./factory";
import { animateFull } from "./rectangle";
import { createSquareSprite } from "./sprite";

const SLIDE = 20;

const edge = (t: Train, ignoreTerminal: boolean) => {
  const lt = t.current()._base();
  const _e = lt.isDeptTask() ? lt.next : lt;
  if (_e.isDeptTask()) {
    return undefined;
  }
  const e = _e as EdgeTask;
  // 上下線が入れ替わる折返し駅の場合補正なし（中央に表示）
  const prev = e.prev.isDeptTask() ? e.prev.prev : e.prev;
  if (
    ignoreTerminal &&
    e.edge.isOutbound !== (prev as EdgeTask).edge.isOutbound
  ) {
    return undefined;
  }
  return e.edge;
};

const _get = (re: RailEdge, fn: (n: number) => number) =>
  re ? SLIDE * fn(re.arrow.angle() + Math.PI / 2) : 0;
const getX = (re: RailEdge) => _get(re, Math.cos);
const getY = (re: RailEdge) => _get(re, Math.sin);

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
  const e = edge(t, true);
  sprite.x = getX(e);
  sprite.y = getY(e);
  sprite.angle = getAngle(edge(t, false));
  sprite.modified();
  if (t.passengers.length === Train.CAPACITY) {
    animateFull(sprite, () => t.passengers.length < Train.CAPACITY);
  }
};

const SHAKE = [2.5, 7.5, 15, 7.5, 2.5, 0, -2.5, -7.5, -15, -7.5, -2.5, 0];

export const riddenModifer = (vo: ViewObject<Train>) => {
  const sprite = vo.viewer.children[0];
  if (sprite.update.length > 0) {
    return;
  }
  let count = 0;
  const baseAngle = getAngle(edge(vo.subject, false));
  const shake = () => {
    if (count < SHAKE.length) {
      sprite.angle = baseAngle + SHAKE[count];
    } else {
      sprite.update.remove(shake);
    }
    sprite.modified();
    count++;
  };
  sprite.update.add(shake);
};

creators.put(Train, (scene, t) => {
  const sprite = createSquareSprite(scene, "train_basic");
  const e = edge(t, true);
  sprite.x = getX(e);
  sprite.y = getY(e);
  sprite.angle = getAngle(edge(t, false));
  sprite.modified();
  return sprite;
});
