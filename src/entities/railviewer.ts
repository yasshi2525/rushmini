import modelListener, { ModelChangeListener } from "../models/listener";
import Station from "../models/station";
import RailEdge from "../models/rail_edge";
import createStationPanel from "./station_view";
import createRailEdgePanel from "./rail_edge_view";

/**
 * 描画物のインスタンス
 */
type ViewObject<T> = { subject: T; viewer: g.E };
type ViewObjectGenerator<T> = (loadedScene: g.Scene, obj: T) => g.E;

/**
 * モデルと描画物のひもづけ
 */
class ViewerContainer<T> {
  private readonly generator: ViewObjectGenerator<T>;
  private caches: ViewObject<T>[] = [];

  constructor(generator: ViewObjectGenerator<T>) {
    this.generator = generator;
  }

  public createListener(
    loadedScene: g.Scene,
    parent: g.E
  ): ModelChangeListener<T> {
    return {
      onDone: (obj: T) => {
        // モデルと描画物を対応づけておかないと、
        // モデルを消すとき、どの描画物を消せばよいか分からない
        const viewer = this.generator(loadedScene, obj);
        this.caches.push({
          subject: obj,
          viewer,
        });
        parent.append(viewer);
      },
      onDelete: (obj: T) => {
        this.caches = this.caches.filter((vo) => {
          if (vo.subject === obj) {
            parent.remove(vo.viewer);
            return false;
          }
        });
      },
    };
  }
}

const createRailViewer = (loadedScene: g.Scene) => {
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

  // 描画物構築関数を持ったオブジェクトを作成
  const railEdge = new ViewerContainer<RailEdge>(createRailEdgePanel);
  const station = new ViewerContainer<Station>(createStationPanel);

  // モデル更新時に描画物を作成するハンドラを登録
  modelListener.railEdge.register(railEdge.createListener(loadedScene, panel));

  modelListener.station.register(station.createListener(loadedScene, panel));

  return panel;
};

export default createRailViewer;
