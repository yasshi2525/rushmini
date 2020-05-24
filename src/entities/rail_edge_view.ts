import RailEdge from "../models/rail_edge";
import { ModelModifier } from "./connector";
import creators from "./creator";

type GetWidthOption = {
  re: RailEdge;
  isForward: boolean;
  band: number;
  slide: number;
};

const getWidth = (opts: GetWidthOption) => {
  const rn = opts.isForward ? opts.re.to : opts.re.from;
  const w =
    opts.re.arrow.length() / 2 +
    (opts.re.isOutbound ? rn.left(opts.slide) : rn.right(opts.slide));
  return Math.max(w, 0) + Math.sqrt(opts.band);
};

type _GetOption = GetWidthOption & { fn: (n: number) => number; width: number };

const _get = (opts: _GetOption) =>
  opts.slide * opts.fn(opts.re.arrow.angle() + Math.PI / 2) -
  ((opts.isForward ? 1 : -1) * (opts.width * opts.fn(opts.re.arrow.angle()))) /
    2;

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

type CreateOption = GetWidthOption & { scene: g.Scene; color?: string };

const createLine = (opts: CreateOption) =>
  new g.FilledRect({
    scene: opts.scene,
    width: getWidth(opts),
    height: opts.band,
    cssColor: opts.color,
    angle: opts.re.arrow.angleDegree(),
    anchorX: 0.5,
    anchorY: 0.5,
  });

export type RailEdgeModuleOption = {
  band: number;
  slide: number;
  color: string;
};

export const createRailEdgeModule = (opts: RailEdgeModuleOption) => (
  scene: g.Scene,
  re: RailEdge
) => {
  const e = new g.E({ scene });
  const forward = createLine({
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
  const backward = createLine({
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

export type RailEdgeModiferOption = { band: number; slide: number };

export const createRailEdgeModuleModifier = (
  opts: RailEdgeModiferOption
): ModelModifier<RailEdge> => (vo) => {
  const re = vo.subject;
  const viewer = vo.viewer;
  const forward = viewer.children[0].children[0];
  const backward = viewer.children[0].children[1];

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

const BORDERS: RailEdgeModuleOption[] = [
  { band: 9, slide: 10, color: "#ffffff" },
  { band: 3, slide: 10, color: "#444444" },
];

export const defaultRailEdgeModifier: ModelModifier<
  RailEdge
>[] = BORDERS.map((opts) => createRailEdgeModuleModifier(opts));

export const registerRailEdgeView = () =>
  BORDERS.forEach((opts) => creators.put(RailEdge, createRailEdgeModule(opts)));
