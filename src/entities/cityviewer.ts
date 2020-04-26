import Company from "../models/company";
import Human from "../models/human";
import { Pointable } from "../models/pointable";
import Residence from "../models/residence";
import createCompanyPanel from "./company_view";
import connect from "./connector";
import ViewObjectFactory, { ViewObject } from "./factory";
import createHumanPanel from "./human_view";
import createResidencePanel from "./residence_view";

type FactoryMapper<T extends Pointable> = {
  key: new (...args: any[]) => T;
  factory: ViewObjectFactory<T>;
  modifier?: (vo: ViewObject<T>) => void;
};

const _createFactory = (
  parent: g.E
): FactoryMapper<Residence | Company | Human>[] => [
  {
    key: Residence,
    factory: new ViewObjectFactory<Residence>(parent, createResidencePanel),
  },
  {
    key: Company,
    factory: new ViewObjectFactory<Company>(parent, createCompanyPanel),
  },
  {
    key: Human,
    factory: new ViewObjectFactory<Human>(parent, createHumanPanel),
    modifier: (vo: ViewObject<Human>) => {
      vo.viewer.x = vo.subject.loc().x - vo.viewer.width / 2;
      vo.viewer.y = vo.subject.loc().y - vo.viewer.height / 2;
      vo.viewer.modified();
    },
  },
];

/**
 * 家、会社、人が生成されたなら描画物を追加する
 * @param loadedScene
 */
const createCityViewer = (loadedScene: g.Scene) => {
  const panel = new g.E({
    scene: loadedScene,
    width: g.game.width,
    height: g.game.height,
  });

  // 描画物構成関数を持つファクトリを作成
  _createFactory(panel).forEach((obj) => {
    // モデル更新時に描画物を作成するハンドラを登録
    connect(obj.factory, obj.key, obj.modifier);
  });

  return panel;
};

export default createCityViewer;
