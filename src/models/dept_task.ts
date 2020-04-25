import LineTask from "./line_task";
import { _createTask } from "./line_task_utils";
import modelListener, { EventType } from "./listener";
import Platform from "./platform";
import RailEdge from "./rail_edge";
import RailLine from "./rail_line";

export class DeptTask extends LineTask {
  public readonly stay: Platform;

  constructor(parent: RailLine, stay: Platform, prev?: LineTask) {
    super(parent, prev);
    this.stay = stay;
    modelListener.add(EventType.CREATED, this);
  }

  public _getDept() {
    return this.stay.on;
  }

  public _getDest() {
    return this.stay.on;
  }

  /**
   * 直前の長さ0以上の移動タスクから、引数の線路への回転角を求める
   * @param edge
   */
  public _angle(edge: RailEdge) {
    if (!this._isNeighbor(edge)) {
      console.warn("could not calculate angle to un-neighbored edge");
      return NaN;
    }
    const prev = this.prev;
    while (prev !== this) {
      if (prev._getLength() > 0) {
        return prev._angle(edge);
      }
    }
    console.warn("line has no edge task");
    return NaN;
  }

  public _getLength() {
    return 0;
  }

  public _isNeighbor(edge: RailEdge) {
    return this.stay.on === edge.from;
  }

  /**
   * 現在地点で路線を分断し、指定された往復路を路線タスクに挿入します
   * Before (a) = (a) -> (b)
   * After  (a) = (a) -> (X) -> (a) -> (a) -> (b)
   * * edge : (a) -> (X)
   * @param edge
   */
  public _insertEdge(edge: RailEdge) {
    const next = this.next; // (a) -> (b)
    const inbound = _createTask(this, edge);
    if (inbound) {
      if (this !== next) {
        // 自身が発車タスクなので、復路の後の発車タスクを追加する
        const dept = new DeptTask(this.parent, this.stay, inbound); // (a) -> (a)
        dept.next = next; // (a) -> (b) -> (c)
        next.prev = dept;
      } else {
        // 単体dept(セルフループ)の場合は例外で発車タスクをつけない
        inbound.next = next;
        next.prev = inbound;
      }
    }
  }

  public _insertPlatform(platform: Platform) {
    console.warn("try to insert platform to DeptTask");
  }
}
export default DeptTask;
