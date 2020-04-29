import DeptTask from "./dept_task";
import Platform from "./platform";
import RailEdge from "./rail_edge";
import RailLine from "./rail_line";
import RailNode from "./rail_node";

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
  }
  public abstract isDeptTask(): this is DeptTask;
  public abstract departure(): RailNode;
  public abstract desttination(): RailNode;
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
}

export default LineTask;
