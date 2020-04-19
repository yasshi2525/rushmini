import Residence from "./residence";
import Company from "./company";
import Vector from "./vector";
import modelListener from "./listener";

class Human {
  private loc: Vector;
  /**
   * 1秒間に何pixcel進むか
   */
  public static SPEED: number = 10;
  public static FPS: number = 30;
  public readonly departure: Residence;
  public readonly destination: Company;

  constructor(departure: Residence, destination: Company) {
    this.loc = new Vector(departure);
    this.departure = departure;
    this.destination = destination;
    modelListener.human.add(this);
  }

  public _getVector() {
    return this.loc;
  }

  private move(p: Vector): void;
  private move(x: number, y: number): void;

  private move(arg1: Vector | number, arg2?: number) {
    if (arg1 instanceof Vector) {
      this.loc = new Vector(arg1.x, arg1.y);
    } else {
      this.loc = new Vector(arg1, arg2);
    }
  }

  public _step(frame: number) {
    const remain = this.loc._sub(this.destination);
    const step = (frame * Human.SPEED) / Human.FPS;
    // オーバーランを防ぐ
    if (step >= remain.length) {
      this.move(this.destination);
    } else {
      this.move(
        this.loc.x + step * Math.cos(remain.angleRadian),
        this.loc.y + step * Math.sin(remain.angleRadian)
      );
    }
  }
}

export default Human;
