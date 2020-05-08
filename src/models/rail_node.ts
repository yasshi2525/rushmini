import modelListener, { EventType } from "./listener";
import Platform from "./platform";
import { angle } from "./point";
import PointableObject from "./pointable";
import RailEdge from "./rail_edge";
import Station from "./station";

const div = (from: number, to: number, r: number) => from * (1 - r) + to * r;

/**
 * 成す角度により、どの程度線を伸ばすと、カーブがつながって見えるか返す
 * (実測値。計算式不明)
 * @param degree
 */
const ratio = (degree: number) => {
  if (degree > 180) degree = 360 - degree;

  if (degree <= 10) return 0.44;
  if (degree <= 15) return div(0.44, 0.48, (degree - 10) / 5);
  if (degree <= 30) return div(0.48, 0.52, (degree - 15) / 15);
  if (degree <= 45) return div(0.52, 0.57, (degree - 30) / 15);
  if (degree <= 60) return div(0.57, 0.66, (degree - 45) / 15);
  if (degree <= 90) return div(0.66, 1.0, (degree - 60) / 30);
  if (degree <= 120) return div(1.0, 2.0, (degree - 90) / 30);
  if (degree <= 135) return div(2.0, 3.35, (degree - 120) / 45);
  return 3.35;
};

const dist = (prev: RailEdge, next: RailEdge, slide: number) => {
  const a = angle(next.arrow, prev.arrow);
  return isNaN(a) ? 0 : slide * Math.sin(a) * ratio((2 - a / Math.PI) * 180);
};

class RailNode extends PointableObject {
  public readonly out: RailEdge[];
  public readonly in: RailEdge[];
  public platform?: Platform;

  constructor(x: number, y: number) {
    super(x, y) /* istanbul ignore next */;
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
    const outE = new RailEdge(this, tail, true);
    const inE = new RailEdge(tail, this, false);
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

  public _fire() {
    console.warn("try to handle by rail node");
  }

  public _giveup() {
    console.warn("try to give up from rail node");
  }

  /**
   * この地点を目的地/出発地とする上りRailEdgeが引き伸ばす距離を返します
   */
  public left(slide: number) {
    if (this.in.length !== 2 || this.out.length !== 2) return 0;
    // 最初に到達したのが前の上り
    // 最後に出発したのが次の上り
    return dist(this.in[0], this.out[1], slide);
  }

  /**
   * この地点を目的地/出発地とする下りRailEdgeが引き伸ばす距離を返します
   */
  public right(slide: number) {
    if (this.in.length !== 2 || this.out.length !== 2) return 0;
    // 最後に到達したのが前の下り
    // 最初に出発したのが次の上り
    return dist(this.in[1], this.out[0], slide);
  }
}

export default RailNode;
