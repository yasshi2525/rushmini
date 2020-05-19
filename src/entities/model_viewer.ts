import "./company_view";
import "./residence_view";
import "./station_view";

import Company from "../models/company";
import Human from "../models/human";
import { EventType as ModelEventType } from "../models/listener";
import { Pointable } from "../models/pointable";
import RailEdge from "../models/rail_edge";
import Residence from "../models/residence";
import Station from "../models/station";
import Train from "../models/train";
import { find } from "../utils/common";
import scenes, { SceneType } from "../utils/scene";
import ticker, { EventType as TickEventType } from "../utils/ticker";
import connect, { ModelModifier } from "./connector";
import creators from "./creator";
import ViewObjectFactory from "./factory";
import { humanModifier } from "./human_view";
import { defaultRailEdgeModifier } from "./rail_edge_view";
import { createFramedRect, createWorkingArea } from "./rectangle";
import { riddenModifer, trainModifer } from "./train_view";

const COLOR = "#ffffff";
const BORDER = 5;

type Config<T extends Pointable> = {
  key: new (...args: any[]) => T;
  desc?: boolean;
  modifers?: ModelModifier<T>[];
  rideModifers?: ModelModifier<T>[];
};

const configs: Config<Pointable>[] = [
  { key: Residence },
  { key: Company },
  { key: Human, desc: true, modifers: [humanModifier] },
  { key: RailEdge, modifers: defaultRailEdgeModifier },
  { key: Station },
  { key: Train, modifers: [trainModifer], rideModifers: [riddenModifer] },
];

/**
 * 指定されたオブジェクトを描画していくコンテナを返します
 * @param key
 * @param parent
 */
const createResourcePanel = <T extends Pointable>(
  config: Config<T>,
  scene: g.Scene
) => {
  const container = new g.E({ scene });
  creators.find(config.key).forEach((creator, idx) => {
    const panel = new g.E({ scene });
    const modifer: { [key in ModelEventType]?: ModelModifier<T> } = {};
    if (config.modifers && config.modifers[idx])
      modifer[ModelEventType.MODIFIED] = config.modifers[idx];
    if (config.rideModifers && config.rideModifers[idx])
      modifer[ModelEventType.RIDDEN] = config.rideModifers[idx];
    connect(
      new ViewObjectFactory<T>(panel, creator, config.desc),
      config.key,
      modifer
    );
    container.append(panel);
  });

  return container;
};

/**
 * モデルを描画していくコンテナを返します
 * @param loadedScene
 */
const createModelViewer = (loadedScene: g.Scene) => {
  const pane = createWorkingArea(loadedScene, { isPane: true });

  configs.forEach((resource) =>
    pane.append(createResourcePanel(resource, loadedScene))
  );
  // スクリーンショットをエンディングで表示させる
  ticker.triggers.find(TickEventType.OVER).register(() => {
    scenes.preserve(SceneType.ENDING, (scene) =>
      g.Util.createSpriteFromE(scene, pane)
    );
  });
  return pane;
};

export default createModelViewer;
