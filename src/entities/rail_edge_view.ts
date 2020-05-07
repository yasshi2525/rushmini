import RailEdge from "../models/rail_edge";
import { ModelModifier } from "./connector";
import creators from "./creator";

const BAND_SIZE = 2;
const SLIDE = 10;
const cssColor = "#aaaaaa";

const getWidth = (re: RailEdge, isForward: boolean) => {
  const rn = isForward ? re.to : re.from;
  const w =
    re.arrow.length() / 2 + (re.isOutbound ? rn.left(SLIDE) : rn.right(SLIDE));
  return Math.max(w, 0) + BAND_SIZE / 2;
};

const _get = (
  re: RailEdge,
  fn: (n: number) => number,
  width: number,
  isForward: boolean
) =>
  SLIDE * fn(re.arrow.angle() + Math.PI / 2) -
  ((isForward ? 1 : -1) * (width * fn(re.arrow.angle()))) / 2 -
  BAND_SIZE / 4;

const getX = (re: RailEdge, width: number, isForward: boolean) =>
  _get(re, Math.cos, width, isForward);

const getY = (re: RailEdge, width: number, isForward: boolean) =>
  _get(re, Math.sin, width, isForward);

const modify = (re: RailEdge, panel: g.E, isForward: boolean) => {
  panel.x = getX(re, panel.width, isForward);
  panel.y = getY(re, panel.width, isForward);
  panel.modified();
};

export const railEdgeModifier: ModelModifier<RailEdge> = (vo) => {
  const re = vo.subject;
  const forward = vo.viewer.children[0].children[0];
  const backward = vo.viewer.children[0].children[1];

  forward.width = getWidth(re, true);
  modify(re, forward, true);

  backward.width = getWidth(re, false);
  modify(re, forward, true);
};

const create = (scene: g.Scene, re: RailEdge, isForward: boolean) =>
  new g.FilledRect({
    scene,
    width: getWidth(re, isForward),
    height: BAND_SIZE,
    cssColor,
    angle: re.arrow.angleDegree(),
    anchorX: 0.5,
    anchorY: 0.5,
  });

creators.put(RailEdge, (scene, re) => {
  const e = new g.E({ scene });

  const forward = create(scene, re, true);
  modify(re, forward, true);

  const backward = create(scene, re, false);
  modify(re, backward, false);

  e.append(forward);
  e.append(backward);

  return e;
});
