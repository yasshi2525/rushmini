import Company from "../models/company";
import Human from "../models/human";
import Residence from "../models/residence";
import createCompanyPanel from "./company_view";
import connect from "./connector";
import ViewObjectFactory, { ViewObject } from "./factory";
import createHumanPanel from "./human_view";
import createResidencePanel from "./residence_view";

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

  // 背景色白
  panel.append(
    new g.FilledRect({
      scene: loadedScene,
      x: 0,
      y: 0,
      width: panel.width,
      height: panel.height,
      cssColor: "#ffffff",
    })
  );

  // 描画物構成関数を持つファクトリを作成

  const residenceFactory = new ViewObjectFactory<Residence>(
    loadedScene,
    panel,
    createResidencePanel
  );

  const companyFactory = new ViewObjectFactory<Company>(
    loadedScene,
    panel,
    createCompanyPanel
  );

  const humanFactory = new ViewObjectFactory<Human>(
    loadedScene,
    panel,
    createHumanPanel
  );

  // モデル更新時に描画物を作成するハンドラを登録
  connect(residenceFactory, Residence);
  connect(companyFactory, Company);
  connect(humanFactory, Human, (vo: ViewObject<Human>) => {
    vo.viewer.x = vo.subject._getVector().x - vo.viewer.width / 2;
    vo.viewer.y = vo.subject._getVector().y - vo.viewer.height / 2;
    vo.viewer.modified();
  });

  return panel;
};

export default createCityViewer;
