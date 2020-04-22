import ViewObjectFactory from "./factory";
import Residence from "../models/residence";
import createResidencePanel from "./residence_view";
import createCompanyPanel from "./company_view";
import createHumanPanel from "./human_view";
import Company from "../models/company";
import Human from "../models/human";
import connect from "./connector";
import modelListener from "../models/listener";

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

  const residence = new ViewObjectFactory<Residence>(
    loadedScene,
    panel,
    createResidencePanel
  );

  const company = new ViewObjectFactory<Company>(
    loadedScene,
    panel,
    createCompanyPanel
  );

  const human = new ViewObjectFactory<Human>(
    loadedScene,
    panel,
    createHumanPanel
  );

  // モデル更新時に描画物を作成するハンドラを登録
  connect(residence, modelListener.residence);
  connect(company, modelListener.company);
  connect(human, modelListener.human);

  return panel;
};

export default createCityViewer;
