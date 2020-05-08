import RailEdge from "../models/rail_edge";
import { ModelModifier } from "./connector";
import creators from "./creator";

const BAND = 2;
const SLIDE = 10;
const COLOR = "#aaaaaa";

type GetWidthOption = {
  re: RailEdge;
  isForward: boolean;
  band?: number;
  slide?: number;
};

const getWidth = (opts: GetWidthOption) => {
  const rn = opts.isForward ? opts.re.to : opts.re.from;
  const w =
    opts.re.arrow.length() / 2 +
    (opts.re.isOutbound
      ? rn.left(opts.slide ?? SLIDE)
      : rn.right(opts.slide ?? SLIDE));
  return Math.max(w, 0) + (opts.band ?? BAND) / 2;
};

type _GetOption = GetWidthOption & { fn: (n: number) => number; width: number };

const _get = (opts: _GetOption) =>
  (opts.slide ?? SLIDE) * opts.fn(opts.re.arrow.angle() + Math.PI / 2) -
  ((opts.isForward ? 1 : -1) * (opts.width * opts.fn(opts.re.arrow.angle()))) /
    2 -
  (opts.band ?? BAND) / 4;

type GetPosOption = Omit<_GetOption, "fn">;

const getX = (opts: GetPosOption) =>
  _get({
    re: opts.re,
    isForward: opts.isForward,
    band: opts.band,
    slide: opts.slide,
    width: opts.width,
    fn: Math.cos,
  });
const getY = (opts: GetPosOption) =>
  _get({
    re: opts.re,
    isForward: opts.isForward,
    band: opts.band,
    slide: opts.slide,
    width: opts.width,
    fn: Math.sin,
  });

type ModifyPosOption = Omit<GetPosOption, "width"> & { panel: g.E };

const modifyPos = (opts: ModifyPosOption) => {
  const o = {
    re: opts.re,
    isForward: opts.isForward,
    band: opts.band,
    slide: opts.slide,
    width: opts.panel.width,
  };
  opts.panel.x = getX(o);
  opts.panel.y = getY(o);
  opts.panel.modified();
};

type ModiferOption = { band?: number; slide?: number };

export const railEdgeModifier = (
  opts: ModiferOption
): ModelModifier<RailEdge> => (vo) => {
  const re = vo.subject;
  const forward = vo.viewer.children[0].children[0];
  const backward = vo.viewer.children[0].children[1];

  forward.width = getWidth({
    re,
    band: opts.band,
    slide: opts.slide,
    isForward: true,
  });
  modifyPos({
    re,
    panel: forward,
    band: opts.band,
    slide: opts.slide,
    isForward: true,
  });

  backward.width = getWidth({
    re,
    band: opts.band,
    slide: opts.slide,
    isForward: false,
  });
  modifyPos({
    re,
    panel: backward,
    band: opts.band,
    slide: opts.slide,
    isForward: false,
  });
};

type CreateOption = GetWidthOption & { scene: g.Scene; color?: string };

const create = (opts: CreateOption) =>
  new g.FilledRect({
    scene: opts.scene,
    width: getWidth(opts),
    height: opts.band ?? BAND,
    cssColor: opts.color ?? COLOR,
    angle: opts.re.arrow.angleDegree(),
    anchorX: 0.5,
    anchorY: 0.5,
  });

export type RailEdgeCandidateOption = {
  band: number;
  slide: number;
  color: string;
};

export const createRailEdgeCandidate = (opts: RailEdgeCandidateOption) => (
  scene: g.Scene,
  re: RailEdge
) => {
  const e = new g.E({ scene });
  const forward = create({
    scene,
    re,
    band: opts.band,
    slide: opts.slide,
    color: opts.color,
    isForward: true,
  });
  modifyPos({
    re,
    band: opts.band,
    slide: opts.slide,
    panel: forward,
    isForward: true,
  });
  const backward = create({
    scene,
    re,
    band: opts.band,
    slide: opts.slide,
    color: opts.color,
    isForward: false,
  });
  modifyPos({
    re,
    band: opts.band,
    slide: opts.slide,
    panel: backward,
    isForward: false,
  });
  e.append(forward);
  e.append(backward);
  return e;
};

creators.put(RailEdge, (scene, re) => {
  const e = new g.E({ scene });

  const forward = create({ scene, re, isForward: true });
  modifyPos({ re, panel: forward, isForward: true });

  const backward = create({ scene, re, isForward: false });
  modifyPos({ re, panel: backward, isForward: false });

  e.append(forward);
  e.append(backward);

  return e;
});
