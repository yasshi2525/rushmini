import DeptTask from "./dept_task";
import LineTask from "./line_task";
import { _createTask } from "./line_task_utils";
import modelListener, { EventType } from "./listener";
import Platform from "./platform";
import { angle } from "./point";
import RailEdge from "./rail_edge";
import RailLine from "./rail_line";

class EdgeTask extends LineTask {
  public readonly edge: RailEdge;

  constructor(parent: RailLine, edge: RailEdge, prev: LineTask) {
    super(parent, prev) /* istanbul ignore next */;
    this.edge = edge;
    modelListener.add(EventType.CREATED, this);
  }

  public isDeptTask() {
    return false;
  }

  public departure() {
    return this.edge.from;
  }

  public destination() {
    return this.edge.to;
  }

  public _angle(edge: RailEdge) {
    if (!this._isNeighbor(edge)) {
      console.warn("could not calculate angle to un-neighbored edge");
      return NaN;
    }
    // 終点から成す角を求めるため、自身の反転ベクトルを使って角度を求める
    return angle(edge.arrow, this.edge.arrow.reverse());
  }

  public length() {
    return this.edge.arrow.length();
  }

  public _isNeighbor(edge: RailEdge) {
    return this.edge.to === edge.from;
  }

  /**
   * 現在地点で路線を分断し、指定された往復路を路線タスクに挿入します
   * Before (a) ===============> (b) -> (c)
   * After  (a) => (X) -> (a) -> (b) -> (c)
   * * edge : (a) -> (X)
   * @param edge
   */
  public _insertEdge(edge: RailEdge) {
    const next = this.next; // (a) -> (b)
    const inbound = _createTask(this, edge);
    if (inbound) {
      inbound.next = next; // (a) -> (b) -> (c)
      next.prev = inbound;
    }
  }

  /**
   * 新たに作成された駅を発車タスクとして挿入します
   * @param platform
   */
  public _insertPlatform(platform: Platform) {
    if (this.destination() !== platform.on) {
      console.warn("try to insert non-neighbored platform");
      return;
    }
    const next = this.next;
    const dept = new DeptTask(this.parent, platform, this);
    dept.next = next;
  }
}

export default EdgeTask;
