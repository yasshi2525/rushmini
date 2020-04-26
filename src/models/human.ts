import Company from "./company";
import modelListener, { EventType } from "./listener";
import Point, { distance } from "./point";
import { Pointable, substract } from "./pointable";
import Residence from "./residence";
import RoutableObject from "./routable";
import { Steppable } from "./steppable";

class Human extends RoutableObject implements Steppable {
  private pos: Point;
  /**
   * 1秒間に何pixcel進むか
   */
  public static SPEED: number = 50;
  public static FPS: number = 30;
  public readonly departure: Residence;
  public readonly destination: Company;

  constructor(departure: Residence, destination: Company) {
    super();
    this.pos = new Point(departure.loc());
    this.departure = departure;
    this.destination = destination;
    modelListener.add(EventType.CREATED, this);
  }

  public loc() {
    return this.pos;
  }

  private move(p: Pointable): void;
  private move(x: number, y: number): void;

  private move(arg1: Pointable | number, arg2?: number) {
    const prev = this.pos;
    if (typeof arg1 === "number") {
      this.pos = new Point(arg1, arg2);
    } else {
      this.pos = new Point(arg1.loc());
    }
    if (distance(this.pos, prev) > 0) {
      modelListener.add(EventType.MODIFIED, this);
    }
  }

  public _step(frame: number) {
    const remain = substract(this.destination, this);
    const step = (frame * Human.SPEED) / Human.FPS;
    // オーバーランを防ぐ
    if (step >= remain.length()) {
      this.move(this.destination);
    } else {
      this.move(
        this.pos.x + step * Math.cos(remain.angle()),
        this.pos.y + step * Math.sin(remain.angle())
      );
    }
  }
}

export default Human;
