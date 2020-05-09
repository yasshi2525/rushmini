import DeptTask from "./dept_task";
import modelListener, { EventType } from "./listener";
import Platform from "./platform";
import RailEdge from "./rail_edge";
import RailLine from "./rail_line";
import RailNode from "./rail_node";
import Train from "./train";

abstract class LineTask {
  public readonly parent: RailLine;
  public prev?: LineTask;
  public next?: LineTask;
  public readonly trains: Train[];

  constructor(parent: RailLine, prev?: LineTask) {
    this.parent = parent;
    if (prev) {
      this.prev = prev;
      prev.next = this;
    } else {
      this.prev = this;
      this.next = this;
    }
    this.trains = [];
  }
  public abstract isDeptTask(): this is DeptTask;
  public abstract departure(): RailNode;
  public abstract destination(): RailNode;
  /**
   * 自タスクの終点から何ラジアン回転すれば引数の線路に一致するか返す。(左回り正)
   * @param edge
   */
  public abstract _angle(edge: RailEdge): number;
  public abstract length(): number;

  /**
   * 指定された線路と隣接しているか判定します
   * @param edge
   */
  public abstract _isNeighbor(edge: RailEdge): boolean;

  /**
   * 現在地点で路線を分断し、指定された往復路を路線タスクに挿入します
   * Before (a) ---------------> (b) -> (c)
   * After  (a) -> (X) -> (a) -> (b) -> (c)
   * * edge : (a) -> (X)
   * @param edge
   */
  public abstract _insertEdge(edge: RailEdge): void;
  public abstract _insertPlatform(platform: Platform): void;
  public _remove() {
    modelListener.add(EventType.DELETED, this);
  }
  /**
   * 現在のタスクの次を指定のタスクに設定します。
   * 今ある中間タスクはすべて削除されます
   * @param to
   */
  public _shrink(to: LineTask) {
    let next = this.next;
    while (next !== to) {
      next.trains.forEach((t) => t._skip(to));
      next._remove();
      next = next.next;
    }
    this.next = to;
    to.prev = this;
    modelListener.add(EventType.MODIFIED, this);
    modelListener.add(EventType.MODIFIED, to);
  }
}

export default LineTask;
