import RailLine from "./rail_line";
import Platform from "./platform";
import RailEdge from "./rail_edge";
import RailNode from "./rail_node";
import modelListener from "./listener";
import Vector from "./vector";

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
  /**
   * 自タスクの終点から何ラジアン回転すれば引数の線路に一致するか返す。(左回り正)
   * @param edge
   */
  public abstract _angle(edge: RailEdge): number;
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

export default LineTask;
