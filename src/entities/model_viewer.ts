import Company from "../models/company";
import Human from "../models/human";
import { Pointable } from "../models/pointable";
import RailEdge from "../models/rail_edge";
import Residence from "../models/residence";
import Station from "../models/station";
import Train from "../models/train";
import "./company_view";
import connect, { ModelModifier } from "./connector";
import creators from "./creator";
import ViewObjectFactory from "./factory";
import { humanModifier } from "./human_view";
import { railEdgeModifier } from "./rail_edge_view";
import { createFramedRect } from "./rectangle";
import "./residence_view";
import "./station_view";
import { trainModifer } from "./train_view";

const SIZE = 0.8;
const COLOR = "#ffffff";
const BORDER = 5;

type Config<T extends Pointable> = {
  key: new (...args: any[]) => T;
  desc?: boolean;
  modifer?: ModelModifier<T>;
};

const configs: Config<Pointable>[] = [
  { key: Residence },
  { key: Company },
  { key: Human, desc: true, modifer: humanModifier },
  { key: RailEdge, modifer: railEdgeModifier({}) },
  { key: Station },
  { key: Train, modifer: trainModifer },
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
  const panel = new g.E({ scene });
  connect(
    new ViewObjectFactory<T>(panel, creators.find(config.key), config.desc),
    config.key,
    config.modifer
  );
  return panel;
};

/**
 * モデルを描画していくコンテナを返します
 * @param loadedScene
 */
const createModelViewer = (loadedScene: g.Scene) => {
  const panel = createFramedRect(
    loadedScene,
    g.game.width * SIZE,
    g.game.height * SIZE,
    COLOR,
    BORDER
  );
  panel.x = (g.game.width * (1 - SIZE)) / 2 - BORDER;
  panel.y = (g.game.height * (1 - SIZE)) / 2 - BORDER;
  panel.modified();

  const pane = new g.Pane({
    scene: loadedScene,
    width: g.game.width * SIZE,
    height: g.game.height * SIZE,
  });
  panel.children[0].append(pane);

  configs.forEach((resource) =>
    pane.append(createResourcePanel(resource, loadedScene))
  );
  return panel;
};

export default createModelViewer;
