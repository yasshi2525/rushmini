import modelListener from "../models/listener";
import Station from "../models/station";
import RailEdge from "../models/rail_edge";
import createStationPanel from "./station_view";
import createRailEdgePanel from "./rail_edge_view";
import connect from "./connector";
import ViewObjectFactory from "./factory";

const createRailViewer = (loadedScene: g.Scene) => {
  const panel = new g.E({
    scene: loadedScene,
    width: g.game.width,
    height: g.game.height,
  });

  // 描画物構築関数を持ったファクトリを作成
  const railEdge = new ViewObjectFactory<RailEdge>(
    loadedScene,
    panel,
    createRailEdgePanel
  );
  const station = new ViewObjectFactory<Station>(
    loadedScene,
    panel,
    createStationPanel
  );

  // モデル更新時に描画物を作成するハンドラを登録
  connect(railEdge, modelListener.railEdge);
  connect(station, modelListener.station);
  return panel;
};

export default createRailViewer;
