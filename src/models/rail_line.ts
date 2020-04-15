import LineTask, { DeptTask, EdgeTask } from "./line_task";
import Platform from "./platform";
import RailEdge from "./rail_edge";
import RailNode from "./rail_node";
import modelListener from "./listener";

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
    var current = this.top;
    do {
      if (current._getDest() == node) {
        result.push(current);
      }
      current = current.next;
    } while (current != this.top);
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
    if (this.top.next == this.top) {
      if (!this.top._isNeighbor(edge)) {
        console.warn("top is not neighbored edge");
        return undefined;
      }
      return this.top;
    }

    // 隣接するタスクを絞り込む
    const result: LineTask[] = [];
    var current = this.top;
    do {
      if (
        // 隣接していないタスクはスキップ
        !current._isNeighbor(edge) ||
        // 駅に到着するタスクはスキップ。発車タスクの後に挿入する
        current.next._getDept() == current.next._getDest() ||
        // 距離0の移動タスクは角度の計算ができないのでスキップ
        (current._getDept() != current._getDest() && current._getLength() === 0)
      ) {
      } else {
        result.push(current);
      }
      current = current.next;
    } while (current != this.top);

    const angle = (task: LineTask) => {
      var prevEdgeTask: LineTask;
      if (task._getDept() != task._getDest()) {
        prevEdgeTask = task;
      } else {
        // DeptTaskの場合、直前の EdgeTaskを参照
        prevEdgeTask = task.prev;
      }

      // 180°以下の角度を求める
      // cos θ = a * b / |a||b|
      const a = {
        x: -prevEdgeTask._getVector().x,
        y: -prevEdgeTask._getVector().y,
      };
      const aLen = Math.sqrt(a.x * a.x + a.y * a.y);
      const b = edge.vector;
      const bLen = Math.sqrt(b.x * b.x + b.y * b.y);
      var theta = Math.acos((a.x * b.x + a.y * b.y) / (aLen * bLen));

      // 右側にある場合(外積の値が負)、角度を 360° - θ にする
      if (a.x * b.y - a.y * b.x < 0) {
        theta = Math.PI * 2 - theta;
      }
      return theta;
    };

    const sorted = result.sort(
      (task1: LineTask, task2: LineTask) => angle(task1) - angle(task2)
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
