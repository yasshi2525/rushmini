import ticker from "../utils/ticker";
import Company from "./company";
import Human from "./human";
import modelListener, { EventType } from "./listener";
import PointableObject from "./pointable";
import { Steppable } from "./steppable";

class Residence extends PointableObject implements Steppable {
  /**
   * 会社の魅力度に応じて住民をスポーンするため、
   * 魅力度の数だけ同じ会社を行き先に設定する
   */
  protected readonly destinations: Company[] = [];

  /**
   * 人の生成速度。INTERVAL_SEC 秒 経過すると1人生成する
   */
  public static INTERVAL_SEC: number = 0.5;
  /**
   * 残り remain frame 経過すると人を生成する
   */
  protected remainFrame: number;
  protected rand: (min: number, max: number) => number;

  constructor(
    destinations: Company[],
    x: number,
    y: number,
    rand: (min: number, max: number) => number
  ) {
    super(x, y) /* istanbul ignore next */;
    this.rand = rand;
    // 会社の魅力度に応じて行き先を比例配分する
    destinations.forEach((c) => {
      for (let i = 0; i < c.attractiveness; i++) {
        this.destinations.push(c);
      }
    });
    this.remainFrame = Math.floor(Residence.INTERVAL_SEC * ticker.fps());
    modelListener.add(EventType.CREATED, this);
  }

  protected _spawn() {
    if (this.destinations.length === 0) {
      console.warn("no destination candinate");
      return undefined;
    }
    const dest = this.destinations.shift();
    this.destinations.push(dest);
    return new Human(this, dest, this.rand);
  }

  public _step() {
    this.remainFrame--;
    if (this.remainFrame <= 0) {
      this._spawn();
      this.remainFrame += Math.floor(Residence.INTERVAL_SEC * ticker.fps());
    }
  }

  public _fire(subject: Human) {
    console.warn("try to move human to residence");
  }

  public _giveup(subject: Human) {
    console.warn("try to give up from residence");
  }
}

export default Residence;
