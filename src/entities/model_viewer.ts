import Company from "../models/company";
import Human from "../models/human";
import { Pointable } from "../models/pointable";
import RailEdge from "../models/rail_edge";
import Residence from "../models/residence";
import Station from "../models/station";
import Train from "../models/train";
import "./company_view";
import connect from "./connector";
import creators from "./creator";
import ViewObjectFactory from "./factory";
import "./human_view";
import "./rail_edge_view";
import "./residence_view";
import "./station_view";
import "./train_view";

const order: (new (...args: any[]) => Pointable)[] = [
  Human,
  Residence,
  Company,
  RailEdge,
  Station,
  Train,
];

/**
 * 指定されたオブジェクトを描画していくコンテナを返します
 * @param key
 * @param parent
 */
const createResourcePanel = <T extends Pointable>(
  key: new (...args: any[]) => T,
  scene: g.Scene
) => {
  const panel = new g.E({ scene });
  connect(new ViewObjectFactory<T>(panel, creators.find(key)), key);
  return panel;
};

/**
 * モデルを描画していくコンテナを返します
 * @param loadedScene
 */
const createModelViewer = (loadedScene: g.Scene) => {
  const panel = new g.E({ scene: loadedScene });
  order.forEach((key) => panel.append(createResourcePanel(key, loadedScene)));
  return panel;
};

export default createModelViewer;
