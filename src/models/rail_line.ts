import DeptTask from "./dept_task";
import LineTask from "./line_task";
import modelListener, { EventType } from "./listener";
import Platform from "./platform";
import RailEdge from "./rail_edge";
import RailNode from "./rail_node";

/**
 * 指定された線路の始点を終点とする隣接タスクを返します
 * @param edge
 */
const _filterNeighbors = (top: LineTask, edge: RailEdge) => {
  const result: LineTask[] = [];
  let current = top;
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
  } while (current !== top);
  return result;
};

/**
 * 候補が複数ある場合、距離0の移動タスクは角度の計算ができないのでスキップ
 * @param neighbors
 */
const _filterOutUnangled = (neighbors: LineTask[]) => {
  if (neighbors.length === 1) {
    return neighbors;
  }
  return neighbors.filter(
    (lt) => !(lt._getDept() !== lt._getDest() && lt._getLength() === 0)
  );
};

/**
 * 次のタスクへの回転角が最も大きいものを返す
 * @param list
 * @param edge
 */
const _findLargestAngle = (list: LineTask[], edge: RailEdge) =>
  list
    .sort(
      (task1: LineTask, task2: LineTask) =>
        task1._angle(edge) - task2._angle(edge)
    )
    .shift();

/**
 * 指定された線路と隣接するタスクの内、右向き正とした角度がもっとも大きいタスクを返します
 * これは線路を分岐させたとき、どの分岐先を選べばよいか判定するためのものです
 * @param edge
 */
const _findFarLeft = (top: LineTask, edge: RailEdge) => {
  if (!top) {
    return undefined;
  }

  // セルフループの場合自身を返す
  if (top.next === top) {
    if (!top._isNeighbor(edge)) {
      console.warn("top is not neighbored edge");
      return undefined;
    }
    return top;
  }

  // 隣接するタスクを絞り込む
  const neighbors = _filterNeighbors(top, edge);
  // 候補が複数ある場合、距離0の移動タスクは角度の計算ができないのでスキップ
  const candinates = _filterOutUnangled(neighbors);
  // 次のタスクへの回転角が最も大きいものを返す
  return _findLargestAngle(candinates, edge);
};

class RailLine {
  public top?: LineTask;

  constructor() {
    modelListener.add(EventType.CREATED, this);
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
    const result = _findFarLeft(this.top, edge);
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

  public _reset() {
    this.top = undefined;
  }
}

export default RailLine;
