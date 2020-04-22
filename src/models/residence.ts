import Company from "./company";
import Human from "./human";
import Vector from "./vector";
import modelListener from "./listener";
import { Steppable } from "./steppable";

class Residence extends Vector implements Steppable {
  /**
   * 会社の魅力度に応じて住民をスポーンするため、
   * 魅力度の数だけ同じ会社を行き先に設定する
   */
  private readonly destinations: Company[] = [];

  /**
   * 人の生成速度。intervalSec 秒 経過すると1人生成する
   */
  private readonly intervalSec: number;

  public static FPS: number = 30;
  /**
   * 残り remain frame 経過すると人を生成する
   */
  private remainFrame: number;

  constructor(
    destinations: Company[],
    intervalSec: number,
    x: number,
    y: number
  ) {
    super(x, y);
    // 会社の魅力度に応じて行き先を比例配分する
    destinations.forEach((c) => {
      for (let i = 0; i < c.attractiveness; i++) {
        this.destinations.push(c);
      }
    });
    if (intervalSec < 1 / Residence.FPS) {
      intervalSec = 1 / Residence.FPS;
      console.warn(`forbit to set interval to less than ${1 / Residence.FPS}`);
    }
    this.intervalSec = intervalSec;
    this.remainFrame = Math.floor(intervalSec * Residence.FPS);
    modelListener.residence._add(this);
  }

  private _spawn() {
    if (this.destinations.length === 0) {
      console.warn("no destination candinate");
      return undefined;
    }
    const dest = this.destinations.shift();
    this.destinations.push(dest);
    return new Human(this, dest);
  }

  public _step(frame: number) {
    this.remainFrame -= frame;
    if (this.remainFrame <= 0) {
      this._spawn();
      this.remainFrame += Math.floor(this.intervalSec * Residence.FPS);
    }
  }
}

export default Residence;
