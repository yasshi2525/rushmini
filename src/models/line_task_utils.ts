import DeptTask from "./dept_task";
import EdgeTask from "./edge_task";
import LineTask from "./line_task";
import RailEdge from "./rail_edge";

/**
 * 現在のタスクに続く RailEdge に沿うタスクを作成します
 * 循環参照によるプロトタイプ生成失敗を防ぐため、別モジュールにしている
 * @param current
 * @param edge
 */
export const _createTask = (current: LineTask, edge: RailEdge) => {
  if (!current._isNeighbor(edge)) {
    console.warn("try to insert non-neighbored edge");
    return undefined;
  }

  const outbound = new EdgeTask(current.parent, edge, current); // (a) -> (X)
  let inbound: EdgeTask;

  if (!edge.to.platform) {
    inbound = new EdgeTask(current.parent, edge.reverse, outbound); // (X) -> (a)
  } else {
    // (X) が駅の場合、発車タスクを挿入
    inbound = new EdgeTask(
      current.parent,
      edge.reverse,
      new DeptTask(current.parent, edge.to.platform, outbound)
    );
  }

  return inbound;
};
