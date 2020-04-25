import modelListener, { EventType } from "./listener";
import Platform from "./platform";
import RailEdge from "./rail_edge";
import Station from "./station";
import Vector from "./vector";

class RailNode extends Vector {
  public readonly out: RailEdge[];
  public readonly in: RailEdge[];
  public platform?: Platform;

  constructor(x: number, y: number) {
    super(x, y);
    this.out = [];
    this.in = [];
    modelListener.add(EventType.CREATED, this);
  }

  /**
   * 指定された地点に線路を伸ばす
   * @param x
   * @param y
   */
  public _extend(x: number, y: number) {
    const tail = new RailNode(x, y);
    const outE = new RailEdge(this, tail);
    const inE = new RailEdge(tail, this);
    outE.reverse = inE;
    inE.reverse = outE;
    return outE;
  }

  /**
   * 駅を建設します
   */
  public _buildStation() {
    if (this.platform) {
      console.warn("try to build station on already deployed");
      return this.platform;
    }
    return new Platform(this, new Station());
  }
}

export default RailNode;
