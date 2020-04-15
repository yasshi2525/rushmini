import RailLine from "./rail_line";
import Platform from "./platform";
import RailEdge from "./rail_edge";
import RailNode from "./rail_node";
import modelListener from "./listener";

abstract class LineTask {
  public readonly parent: RailLine;
  public prev?: LineTask;
  public next?: LineTask;

  constructor(parent: RailLine, prev?: LineTask) {
    this.parent = parent;
    if (prev) {
      this.prev = prev;
      prev.next = this;
    } else {
      this.prev = this;
      this.next = this;
    }
    modelListener.lineTask.add(this);
  }

  public abstract _getDept(): RailNode;
  public abstract _getDest(): RailNode;
  public abstract _getVector(): { readonly x: number; readonly y: number };
  public abstract _getLength(): number;

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
}

export class DeptTask extends LineTask {
  public readonly stay: Platform;
  private readonly vector = { x: 0, y: 0 };

  constructor(parent: RailLine, stay: Platform, prev?: LineTask) {
    super(parent, prev);
    this.stay = stay;
  }

  public _getDept() {
    return this.stay.on;
  }

  public _getDest() {
    return this.stay.on;
  }

  public _getVector() {
    return this.vector;
  }

  public _getLength() {
    return 0;
  }

  public _isNeighbor(edge: RailEdge) {
    return this.stay.on == edge.from;
  }

  /**
   * 現在地点で路線を分断し、指定された往復路を路線タスクに挿入します
   * Before (a) = (a) -> (b)
   * After  (a) = (a) -> (X) -> (a) -> (a) -> (b)
   * * edge : (a) -> (X)
   * @param edge
   */
  public _insertEdge(edge: RailEdge) {
    if (!this._isNeighbor(edge)) {
      console.warn("try to insert non-neighbored edge");
      return;
    }

    const next = this.next; // (a) -> (b)
    const outbound = new EdgeTask(this.parent, edge, this); // (a) -> (X)
    var inbound: EdgeTask;

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

    if (this != next) {
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

  public _insertPlatform(platform: Platform) {
    console.warn("try to insert platform to DeptTask");
  }
}

export class EdgeTask extends LineTask {
  public readonly edge: RailEdge;

  constructor(parent: RailLine, edge: RailEdge, prev: LineTask) {
    super(parent, prev);
    this.edge = edge;
  }

  public _getDept() {
    return this.edge.from;
  }

  public _getDest() {
    return this.edge.to;
  }

  public _getVector() {
    return this.edge.vector;
  }

  public _getLength() {
    return this.edge.length;
  }

  public _isNeighbor(edge: RailEdge) {
    return this.edge.to == edge.from;
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

    var inbound: EdgeTask;

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
    if (this._getDest() != platform.on) {
      console.warn("try to insert non-neighbored platform");
      return;
    }
    const next = this.next;
    const dept = new DeptTask(this.parent, platform, this);
    dept.next = next;
  }
}

export default LineTask;
