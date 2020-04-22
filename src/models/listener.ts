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
  public _add(obj: T) {
    this.queue.push(obj);
  }

  public _done() {
    let e = this.queue.shift();
    while (e) {
      this.handlers.forEach((l) => l.onDone(e));
      e = this.queue.shift();
    }
  }

  public _delete(target: T) {
    this.handlers.forEach((l) => l.onDelete(target));
  }

  /**
   * add したオブジェクトをすべて削除する(通知なし)
   */
  public _flush() {
    this.queue.length = 0;
  }

  /**
   * register したリスナを削除する
   */
  public _unregisterAll() {
    this.handlers.length = 0;
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
  /**
   * キャッシュしているオブジェクトをリスナに通知する
   */
  done: () => {
    modelListener.company._done();
    modelListener.residence._done();
    modelListener.railNode._done();
    modelListener.railEdge._done();
    modelListener.station._done();
    modelListener.gate._done();
    modelListener.platform._done();
    modelListener.railLine._done();
    modelListener.lineTask._done();
    modelListener.human._done();
  },
  /**
   * キャッシュしているオブジェクトを破棄する
   */
  flush: () => {
    modelListener.company._flush();
    modelListener.residence._flush();
    modelListener.railNode._flush();
    modelListener.railEdge._flush();
    modelListener.station._flush();
    modelListener.gate._flush();
    modelListener.platform._flush();
    modelListener.railLine._flush();
    modelListener.lineTask._flush();
    modelListener.human._flush();
  },
};

export default modelListener;
