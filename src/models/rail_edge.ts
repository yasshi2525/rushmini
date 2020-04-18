import RailNode from "./rail_node";
import modelListener from "./listener";
import Vector from "./vector";

class RailEdge {
  public readonly from: RailNode;
  public readonly to: RailNode;
  public reverse?: RailEdge;
  /**
   * 始点から終点に向かうベクトル
   */
  public readonly vector: Vector;

  constructor(from: RailNode, to: RailNode) {
    this.from = from;
    this.to = to;
    from.out.push(this);
    to.in.push(this);
    this.vector = new Vector(to.x - from.x, to.y - from.y);
    modelListener.railEdge.add(this);
  }
}

export default RailEdge;
