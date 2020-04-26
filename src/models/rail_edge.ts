import modelListener, { EventType } from "./listener";
import Point from "./point";
import { center, Pointable, substract } from "./pointable";
import RailNode from "./rail_node";

class RailEdge implements Pointable {
  public readonly from: RailNode;
  public readonly to: RailNode;
  public reverse?: RailEdge;
  /**
   * 始点から終点に向かうベクトル
   */
  public readonly arrow: Point;

  constructor(from: RailNode, to: RailNode) {
    this.from = from;
    this.to = to;
    from.out.push(this);
    to.in.push(this);
    this.arrow = substract(from, to);
    modelListener.add(EventType.CREATED, this);
  }

  public loc() {
    return center(this.to, this.from);
  }
}

export default RailEdge;
