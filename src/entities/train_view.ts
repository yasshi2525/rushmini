import EdgeTask from "../models/edge_task";
import RailEdge from "../models/rail_edge";
import Train from "../models/train";
import { ViewObject } from "./factory";
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
  const panel = vo.viewer.children[0];
  const t = vo.subject;
  const e = edge(t, true);
  panel.x = getX(e);
  panel.y = getY(e);
  panel.angle = getAngle(edge(t, false));
  panel.modified();
  if (t.passengers.length === Train.CAPACITY) {
    panel.children[0].hide();
    panel.children[1].show();
  } else {
    panel.children[0].show();
    panel.children[1].hide();
  }
};

const SHAKE = [2.5, 7.5, 15, 7.5, 2.5, 0, -2.5, -7.5, -15, -7.5, -2.5, 0];

export const riddenModifer = (vo: ViewObject<Train>) => {
  const panel = vo.viewer.children[0];
  if (panel.update.length > 0) {
    return;
  }
  let count = 0;
  const baseAngle = getAngle(edge(vo.subject, false));
  const shake = () => {
    if (count < SHAKE.length) {
      panel.angle = baseAngle + SHAKE[count];
    } else {
      panel.update.remove(shake);
    }
    panel.modified();
    count++;
  };
  panel.update.add(shake);
};

export const generateTrainCreator = (scene: g.Scene, t: Train) => {
  const panel = new g.E({ scene });
  const sprite = createSquareSprite(scene, "train_basic");
  panel.append(sprite);
  const spriteFull = createSquareSprite(scene, "crowed_train_img");
  spriteFull.hide();
  panel.append(spriteFull);

  const e = edge(t, true);
  panel.width = sprite.width;
  panel.height = sprite.height;
  panel.x = getX(e);
  panel.y = getY(e);
  panel.angle = getAngle(edge(t, false));
  panel.modified();
  return panel;
};
