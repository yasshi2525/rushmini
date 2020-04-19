import LineTask from "./line_task";
import Platform from "./platform";
import RailEdge from "./rail_edge";
import RailNode from "./rail_node";
import modelListener from "./listener";
import DeptTask from "./dept_task";

class RailLine {
  public top?: LineTask;

  constructor() {
    modelListener.railLine.add(this);
  }

  /**
   * 指定された点を出発点と持つタスクを絞り込みます
   * @param node
   */
  private filterDestIs(node: RailNode) {
    if (!this.top) {
      return [];
    }

    const result: LineTask[] = [];
    let current = this.top;
    do {
      if (current._getDest() === node) {
        result.push(current);
      }
      current = current.next;
    } while (current !== this.top);
    return result;
  }

  /**
   * 指定された線路と隣接するタスクの内、右向き正とした角度がもっとも大きいタスクを返します
   * これは線路を分岐させたとき、どの分岐先を選べばよいか判定するためのものです
   * @param edge
   */
  private findFarLeft(edge: RailEdge) {
    if (!this.top) {
      return undefined;
    }

    // セルフループの場合自身を返す
    if (this.top.next === this.top) {
      if (!this.top._isNeighbor(edge)) {
        console.warn("top is not neighbored edge");
        return undefined;
      }
      return this.top;
    }

    // 隣接するタスクを絞り込む
    let result: LineTask[] = [];
    let current = this.top;
    do {
      if (
        // 隣接していないタスクはスキップ
        !current._isNeighbor(edge) ||
        // 駅に到着するタスクはスキップ。発車タスクの後に挿入する
        current.next._getDept() === current.next._getDest()
      ) {
        // do-nothing
      } else {
        result.push(current);
      }
      current = current.next;
    } while (current !== this.top);

    // 候補が複数ある場合、距離0の移動タスクは角度の計算ができないのでスキップ
    if (result.length > 0) {
      result = result.filter(
        (lt) =>
          current._getDept() === current._getDest() || current._getLength() > 0
      );
    }

    // 次のタスクへの回転角が最も大きいものを返す
    const sorted = result.sort(
      (task1: LineTask, task2: LineTask) =>
        task1._angle(edge) - task2._angle(edge)
    );
    return sorted.length === 0 ? undefined : sorted[0];
  }

  /**
   * 路線設定を開始する。発車タスクを設定する
   * @param platform
   */
  public _start(platform: Platform) {
    if (this.top) {
      console.warn("try to start already constructed line");
      return;
    }
    this.top = new DeptTask(this, platform);
  }

  /**
   * 指定された線路を自路線に組み込みます
   * @param edge
   */
  public _insertEdge(edge: RailEdge) {
    const result = this.findFarLeft(edge);
    if (!result) {
      console.warn("no insert candinate");
      return;
    }
    result._insertEdge(edge);
  }

  /**
   * 指定された駅を自路線に組み込みます
   * @param platform
   */
  public _insertPlatform(platform: Platform) {
    this.filterDestIs(platform.on).forEach((lt) =>
      lt._insertPlatform(platform)
    );
  }
}

export default RailLine;
