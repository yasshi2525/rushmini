import cityResource from "../models/city_resource";
import modelListener, { EventType as ModelEventType } from "../models/listener";
import random from "../utils/random";
import routeFinder from "../utils/route_finder";
import stepper from "../utils/stepper";
import ticker, { EventType as TickEventType } from "../utils/ticker";
import transportFinder from "../utils/transport_finder";
import createBackground from "./background";
import createBonusPanel from "./bonus";
import createBonusBranch from "./bonus_branch";
import createBranchBuilder from "./branch_builder";
import createBuilder from "./builder";
import createCursor from "./cursor";
import createMask from "./mask";
import createModelViewer from "./model_viewer";
import createRailBuildGuide from "./railbuild_guide";
import createScoreLabel from "./score";
import createTickLabel from "./tick";

type Controller = {
  [index: string]: g.E | boolean | ((...args: any[]) => void);
  isBonusing: boolean;
  background?: g.E;
  model?: g.E;
  guide?: g.E;
  mask?: g.E;
  tick?: g.E;
  score?: g.E;
  builder?: g.E;
  branch_builder?: g.E;
  cursor?: g.E;
  bonusPanel?: g.E;
  bonusBranch?: g.E;
  init: (scene: g.Scene) => void;
  reset: () => void;
};

const initController = (width: number, height: number) => {
  transportFinder.init();
  routeFinder.init();
  stepper.init();
  cityResource.init(width, height, (min, max) => random.random().get(min, max));
  modelListener.fire(ModelEventType.CREATED);
  ticker.triggers.find(TickEventType.TICKED).register(() => stepper.step());
};

type Handler = {
  set: (e: g.E) => void;
  gen: (scene: g.Scene) => g.E;
  parent?: () => g.E;
};

const order = (_c: Controller): Handler[] => [
  { set: (e) => (_c.background = e), gen: createBackground },
  { set: (e) => (_c.model = e), gen: createModelViewer },
  { set: (e) => (_c.guide = e), gen: createRailBuildGuide },
  { set: (e) => (_c.mask = e), gen: createMask },
  { set: (e) => (_c.tick = e), gen: createTickLabel },
  { set: (e) => (_c.score = e), gen: createScoreLabel },
  { set: (e) => (_c.builder = e), gen: createBuilder },
  {
    set: (e) => {
      _c.branch_builder = e;
    },
    gen: (s) => createBranchBuilder(s, () => (_c.isBonusing = false)),
  },
  { set: (e) => (_c.cursor = e), gen: createCursor },
  {
    set: (e) => (_c.bonusPanel = e),
    gen: (s) =>
      createBonusPanel(
        s,
        () => {
          _c.isBonusing = true;
          _c.mask.show();
        },
        () => _c.isBonusing
      ),
  },
  {
    set: (e) => (_c.bonusBranch = e),
    gen: (s) =>
      createBonusBranch(s, () => {
        _c.bonusPanel.hide();
        _c.branch_builder.show();
      }),
    parent: () => _c.bonusPanel,
  },
];

const c: Controller = {
  isBonusing: false,
  init: (loadedScene: g.Scene) => {
    order(c).forEach((hn) => {
      const panel = hn.gen(loadedScene);
      hn.set(panel);
      const parent = hn.parent ? hn.parent() : loadedScene;
      parent.append(panel);
    });
    initController(c.builder.width, c.builder.height);
  },
  reset: () => (c.isBonusing = false),
};

const controller = c;

export default controller;
