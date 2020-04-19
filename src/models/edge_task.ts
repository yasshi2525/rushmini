import RailEdge from "./rail_edge";
import LineTask from "./line_task";
import Vector from "./vector";
import RailLine from "./rail_line";
import DeptTask from "./dept_task";
import Platform from "./platform";

class EdgeTask extends LineTask {
  public readonly edge: RailEdge;
  private readonly reverse: Vector;

  constructor(parent: RailLine, edge: RailEdge, prev: LineTask) {
    super(parent, prev);
    this.edge = edge;
    this.reverse = edge.vector._reverse();
  }

  public _getDept() {
    return this.edge.from;
  }

  public _getDest() {
    return this.edge.to;
  }

  public _angle(edge: RailEdge) {
    if (!this._isNeighbor(edge)) {
      console.warn("could not calculate angle to un-neighbored edge");
      return NaN;
    }
    // 終点から成す角を求めるため、自身の反転ベクトルを使って角度を求める
    return this.reverse._angle(edge.vector);
  }

  public _getLength() {
    return this.edge.vector.length;
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
    if (!this._isNeighbor(edge)) {
      console.warn("try to insert non-neighbored edge");
      return;
    }

    const next = this.next; // (b) -> (c)
    const outbound = new EdgeTask(this.parent, edge, this); // (a) -> (X)

    let inbound: EdgeTask;

    if (!edge.to.platform) {
      inbound = new EdgeTask(this.parent, edge.reverse, outbound); // (X) -> (a)
    } else {
      // (X) が駅の場合、発車タスクを挿入
      inbound = new EdgeTask(
        this.parent,
        edge.reverse,
        new DeptTask(this.parent, edge.to.platform, outbound)
      );
    }
    inbound.next = next; // (a) -> (b) -> (c)
    next.prev = inbound;
  }

  /**
   * 新たに作成された駅を発車タスクとして挿入します
   * @param platform
   */
  public _insertPlatform(platform: Platform) {
    if (this._getDest() !== platform.on) {
      console.warn("try to insert non-neighbored platform");
      return;
    }
    const next = this.next;
    const dept = new DeptTask(this.parent, platform, this);
    dept.next = next;
  }
}

export default EdgeTask;
