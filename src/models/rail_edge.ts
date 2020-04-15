import RailNode from "./rail_node";
import modelListener from "./listener";

class RailEdge {
  public readonly from: RailNode;
  public readonly to: RailNode;
  public reverse?: RailEdge;
  /**
   * 始点から終点に向かうベクトル
   */
  public readonly vector: { readonly x: number; readonly y: number };
  /**
   * 線路の長さ
   */
  public readonly length: number;
  /**
   * 始点から終点までの角度(度数)
   */
  public readonly angle: number;

  constructor(from: RailNode, to: RailNode) {
    this.from = from;
    this.to = to;
    from.out.push(this);
    to.in.push(this);
    this.vector = {
      x: to.x - from.x,
      y: to.y - from.y,
    };
    this.length = Math.sqrt(
      this.vector.x * this.vector.x + this.vector.y * this.vector.y
    );
    this.angle = (Math.atan2(this.vector.y, this.vector.x) * 180) / Math.PI;
    modelListener.railEdge.add(this);
  }
}

export default RailEdge;
