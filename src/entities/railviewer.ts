import RailEdge from "../models/rail_edge";
import Station from "../models/station";
import connect from "./connector";
import ViewObjectFactory from "./factory";
import createRailEdgePanel from "./rail_edge_view";
import createStationPanel from "./station_view";

const createRailViewer = (loadedScene: g.Scene) => {
  const panel = new g.E({
    scene: loadedScene,
    width: g.game.width,
    height: g.game.height,
  });

  // 描画物構築関数を持ったファクトリを作成
  const railEdgeFactory = new ViewObjectFactory<RailEdge>(
    loadedScene,
    panel,
    createRailEdgePanel
  );
  const stationFactory = new ViewObjectFactory<Station>(
    loadedScene,
    panel,
    createStationPanel
  );

  // モデル更新時に描画物を作成するハンドラを登録
  connect(railEdgeFactory, RailEdge);
  connect(stationFactory, Station);
  return panel;
};

export default createRailViewer;
