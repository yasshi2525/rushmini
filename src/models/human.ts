import ticker from "../utils/ticker";
import Company from "./company";
import modelListener, { EventType } from "./listener";
import Point, { distance } from "./point";
import { Pointable, substract } from "./pointable";
import Residence from "./residence";
import RoutableObject, { Routable } from "./routable";
import { Steppable } from "./steppable";

export enum HumanState {
  SPAWNED,
  MOVE,
  WAIT_ENTER_GATE,
  WAIT_ENTER_PLATFORM,
  WAIT_TRAIN,
  ON_TRAIN,
  WAIT_EXIT_GATE,
  ARCHIVED,
}

class Human extends RoutableObject implements Steppable {
  private _state: HumanState;
  private pos: Point;
  /**
   * 1秒間に何pixcel進むか
   */
  public static SPEED: number = 50;
  public readonly departure: Residence;
  public readonly destination: Company;
  /**
   * 次に向かう経由点
   */
  private next: Routable;

  constructor(departure: Residence, destination: Company) {
    super();
    this._state = HumanState.SPAWNED;
    this.pos = new Point(departure.loc());
    this.departure = departure;
    this.destination = destination;
    this.next = departure.nextFor(destination);
    modelListener.add(EventType.CREATED, this);
  }

  public state(change?: HumanState) {
    if (change) {
      this._state = change;
    }
    return this._state;
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
      this.pos = arg1.loc();
    }
    if (distance(this.pos, prev) > 0) {
      modelListener.add(EventType.MODIFIED, this);
    }
  }

  public _seek(goal: Pointable) {
    const remain = substract(goal, this);
    const available = Human.SPEED / ticker.fps();
    if (available >= remain.length()) {
      // オーバーランを防ぐ
      this.move(goal);
      return true;
    } else {
      this.move(
        this.pos.x + available * Math.cos(remain.angle()),
        this.pos.y + available * Math.sin(remain.angle())
      );
      return false;
    }
  }

  public _fire() {
    console.warn("try to handle human");
  }

  public _step() {
    if (this.next) this.next._fire(this, () => this._complete());
  }

  private _complete() {
    this.next = this.next.nextFor(this.destination);
  }
}

export default Human;
