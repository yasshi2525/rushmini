import RailEdge from "../models/rail_edge";
import Station from "../models/station";
import Train from "../models/train";
import connect from "./connector";
import ViewObjectFactory, { ViewObject } from "./factory";
import createRailEdgePanel from "./rail_edge_view";
import createStationPanel from "./station_view";
import createTrainPanel from "./train_view";

const createRailViewer = (loadedScene: g.Scene) => {
  const panel = new g.E({
    scene: loadedScene,
    width: g.game.width,
    height: g.game.height,
  });

  // 描画物構築関数を持ったファクトリを作成
  const railEdgeFactory = new ViewObjectFactory<RailEdge>(
    panel,
    createRailEdgePanel
  );
  const stationFactory = new ViewObjectFactory<Station>(
    panel,
    createStationPanel
  );

  const trainFactory = new ViewObjectFactory<Train>(panel, createTrainPanel);

  // モデル更新時に描画物を作成するハンドラを登録
  connect(railEdgeFactory, RailEdge);
  connect(stationFactory, Station);
  connect(trainFactory, Train, (vo: ViewObject<Train>) => {
    vo.viewer.x = vo.subject.loc().x - vo.viewer.width / 2;
    vo.viewer.y = vo.subject.loc().y - vo.viewer.height / 2;
    vo.viewer.modified();
  });
  return panel;
};

export default createRailViewer;
