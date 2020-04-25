import Company from "./company";
import Human from "./human";
import modelListener, { EventType } from "./listener";
import { Steppable } from "./steppable";
import Vector from "./vector";

class Residence extends Vector implements Steppable {
  /**
   * 会社の魅力度に応じて住民をスポーンするため、
   * 魅力度の数だけ同じ会社を行き先に設定する
   */
  private readonly destinations: Company[] = [];

  /**
   * 人の生成速度。INTERVAL_SEC 秒 経過すると1人生成する
   */
  public static INTERVAL_SEC: number = 0.2;

  public static FPS: number = 30;
  /**
   * 残り remain frame 経過すると人を生成する
   */
  private remainFrame: number;

  private humanEventHandler: (h: Human) => void;

  constructor(
    destinations: Company[],
    x: number,
    y: number,
    cb: (h: Human) => void
  ) {
    super(x, y);
    // 会社の魅力度に応じて行き先を比例配分する
    destinations.forEach((c) => {
      for (let i = 0; i < c.attractiveness; i++) {
        this.destinations.push(c);
      }
    });
    this.remainFrame = Math.floor(Residence.INTERVAL_SEC * Residence.FPS);
    this.humanEventHandler = cb;
    modelListener.add(EventType.CREATED, this);
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
      const h = this._spawn();
      if (h) {
        this.humanEventHandler(h);
      }
      this.remainFrame += Math.floor(Residence.INTERVAL_SEC * Residence.FPS);
    }
  }
}

export default Residence;
