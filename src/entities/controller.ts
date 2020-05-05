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
import createCursor from "./cursor";
import createModelViewer from "./model_viewer";
import createRailBuildGuide from "./railbuild_guide";
import createScoreLabel from "./score";
import createSensor from "./sensor";
import createTickLabel from "./tick";

type Controller = {
  [index: string]: g.E | ((...args: any[]) => void);
  background?: g.E;
  model?: g.E;
  guide?: g.E;
  tick?: g.E;
  score?: g.E;
  cursor?: g.E;
  sensor?: g.E;
  bonusPanel?: g.E;
  bonusBranch?: g.E;
  init: (scene: g.Scene) => void;
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
  { set: (e) => (_c.tick = e), gen: createTickLabel },
  { set: (e) => (_c.score = e), gen: createScoreLabel },
  { set: (e) => (_c.cursor = e), gen: createCursor },
  { set: (e) => (_c.sensor = e), gen: createSensor },
  {
    set: (e) => (_c.bonusPanel = e),
    gen: (s) => createBonusPanel(s, () => _c.cursor.hide()),
  },
  {
    set: (e) => (_c.bonusBranch = e),
    gen: (s) =>
      createBonusBranch(s, () => {
        _c.bonusPanel.hide();
        _c.cursor.show();
      }),
    parent: () => _c.bonusPanel,
  },
];

const c: Controller = {
  init: (loadedScene: g.Scene) => {
    order(c).forEach((hn) => {
      const panel = hn.gen(loadedScene);
      hn.set(panel);
      const parent = hn.parent ? hn.parent() : loadedScene;
      parent.append(panel);
    });
    initController(c.sensor.width, c.sensor.height);
  },
};

const controller = c;

export default controller;
