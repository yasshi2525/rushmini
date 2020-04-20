import RailNode from "./rail_node";
import RailEdge from "./rail_edge";
import Station from "./station";
import Gate from "./gate";
import Platform from "./platform";
import RailLine from "./rail_line";
import LineTask from "./line_task";
import Company from "./company";
import Residence from "./residence";
import Human from "./human";

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

  /**
   * オブジェクトを追加します
   * @param obj
   */
  public add(obj: T) {
    this.queue.push(obj);
  }

  public done() {
    let e = this.queue.shift();
    while (e) {
      this.handlers.forEach((l) => l.onDone(e));
      e = this.queue.shift();
    }
  }

  public delete(target: T) {
    this.handlers.forEach((l) => l.onDelete(target));
  }
}

const modelListener = {
  company: new ListenerContainer<Company>(),
  residence: new ListenerContainer<Residence>(),
  railNode: new ListenerContainer<RailNode>(),
  railEdge: new ListenerContainer<RailEdge>(),
  station: new ListenerContainer<Station>(),
  gate: new ListenerContainer<Gate>(),
  platform: new ListenerContainer<Platform>(),
  railLine: new ListenerContainer<RailLine>(),
  lineTask: new ListenerContainer<LineTask>(),
  human: new ListenerContainer<Human>(),
  done: () => {
    modelListener.company.done();
    modelListener.residence.done();
    modelListener.railNode.done();
    modelListener.railEdge.done();
    modelListener.station.done();
    modelListener.gate.done();
    modelListener.platform.done();
    modelListener.railLine.done();
    modelListener.lineTask.done();
    modelListener.human.done();
  },
};

export default modelListener;
