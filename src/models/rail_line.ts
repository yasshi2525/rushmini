import DeptTask from "./dept_task";
import LineTask from "./line_task";
import modelListener, { EventType } from "./listener";
import Platform from "./platform";
import RailEdge from "./rail_edge";

/**
 * 指定した条件にあうタスクを絞り込みます
 * @param l
 * @param cond
 */
const _filter = (l: RailLine, cond: (lt: LineTask) => boolean) => {
  if (!l.top) return [];
  const result: LineTask[] = [];
  let current: LineTask = l.top;
  do {
    if (cond(current)) {
      result.push(current);
    }
    current = current.next;
  } while (current !== l.top);
  return result;
};

/**
 * 指定された線路の始点を終点とする隣接タスクを返します
 * @param l
 * @param edge
 */
const _filterNeighbors = (l: RailLine, edge: RailEdge) =>
  // 隣接していないタスクはスキップ
  // 駅に到着するタスクはスキップ。発車タスクの後に挿入する
  _filter(l, (lt) => lt._isNeighbor(edge) && !lt.next.isDeptTask());

/**
 * 候補が複数ある場合、距離0の移動タスクは角度の計算ができないのでスキップ
 * @param neighbors
 */
const _filterOutUnangled = (neighbors: LineTask[]) => {
  if (neighbors.length === 1) {
    return neighbors;
  }
  return neighbors.filter((lt) => lt.isDeptTask() || lt.length() > 0);
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
const _findFarLeft = (l: RailLine, edge: RailEdge) => {
  if (!l.top) {
    return undefined;
  }

  // セルフループの場合自身を返す
  if (l.top.next === l.top) {
    if (!l.top._isNeighbor(edge)) {
      console.warn("top is not neighbored edge");
      return undefined;
    }
    return l.top;
  }

  // 隣接するタスクを絞り込む
  const neighbors = _filterNeighbors(l, edge);
  // 候補が複数ある場合、距離0の移動タスクは角度の計算ができないのでスキップ
  const candinates = _filterOutUnangled(neighbors);
  // 次のタスクへの回転角が最も大きいものを返す
  return _findLargestAngle(candinates, edge);
};

class RailLine {
  public top?: DeptTask;

  constructor() {
    modelListener.add(EventType.CREATED, this);
  }

  /**
   * 指定された条件を満たすタスクを絞り込みます
   * @param cond
   */
  public filter(cond: (lt: LineTask) => boolean) {
    return _filter(this, cond);
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
   * 指定された線路を自路線に組み込みます。
   * ロールバックのため、延伸前の接続を返します
   * @param edge
   */
  public _insertEdge(edge: RailEdge) {
    const result = _findFarLeft(this, edge);
    if (!result) {
      console.warn("no insert candinate");
      return [undefined, undefined];
    }
    const prevNext = result.next;
    result._insertEdge(edge);
    return [result, prevNext];
  }

  /**
   * 指定された駅を自路線に組み込みます
   * @param platform
   */
  public _insertPlatform(platform: Platform) {
    this.filter((lt) => lt.destination() === platform.on).forEach((lt) =>
      lt._insertPlatform(platform)
    );
  }

  public length() {
    if (!this.top) return 0;
    let current: LineTask = this.top;
    let len = 0;
    do {
      len += current.length();
      current = current.next;
    } while (current !== this.top);
    return len;
  }
}

export default RailLine;
