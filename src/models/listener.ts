import RailNode from "./rail_node";
import RailEdge from "./rail_edge";
import Station from "./station";
import Gate from "./gate";
import Platform from "./platform";
import RailLine from "./rail_line";
import LineTask from "./line_task";

/**
 * モデルの変化を監視するリスナがもつべきメソッド
 */
export type ModelChangeListener<T> = {
  onDone: (ev: T) => void;
  onDelete: (ev: T) => void;
};

/**
 * モデルの変化を検知する
 */
export class ListenerContainer<T> {
  private readonly handlers: ModelChangeListener<T>[] = [];

  /**
   * Doneイベント発火待ちのリスト
   */
  private readonly queue: T[] = [];

  public register(listener: ModelChangeListener<T>) {
    this.handlers.push(listener);
  }

  public add(obj: T) {
    this.queue.push(obj);
  }

  public done() {
    var e: T;
    while ((e = this.queue.shift())) {
      this.handlers.forEach((l) => l.onDone(e));
    }
  }

  public delete(target: T) {
    this.handlers.forEach((l) => l.onDelete(target));
  }
}

const modelListener = {
  railNode: new ListenerContainer<RailNode>(),
  railEdge: new ListenerContainer<RailEdge>(),
  station: new ListenerContainer<Station>(),
  gate: new ListenerContainer<Gate>(),
  platform: new ListenerContainer<Platform>(),
  railLine: new ListenerContainer<RailLine>(),
  lineTask: new ListenerContainer<LineTask>(),
  done: () => {
    modelListener.railNode.done();
    modelListener.railEdge.done();
    modelListener.station.done();
    modelListener.gate.done();
    modelListener.platform.done();
    modelListener.railLine.done();
    modelListener.lineTask.done();
  },
};

export default modelListener;
