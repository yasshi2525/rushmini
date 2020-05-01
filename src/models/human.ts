import ticker from "../utils/ticker";
import Company from "./company";
import DeptTask from "./dept_task";
import modelListener, { EventType } from "./listener";
import Platform from "./platform";
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
  WAIT_ENTER_DEPTQUEUE,
  WAIT_TRAIN_ARRIVAL,
  WAIT_ENTER_TRAIN,
  ON_TRAIN,
  WAIT_EXIT_TRAIN,
  WAIT_EXIT_PLATFORM,
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
  /**
   * 会社に到着した際の加点
   */
  public static COMPLETE_SCORE: number = 0;
  public readonly departure: Residence;
  public readonly destination: Company;
  /**
   * 次に向かう経由点
   */
  private next: Routable;
  /**
   * 降車時に払う運賃
   */
  private payment: number;

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

  public _move(p: Pointable): void;
  public _move(x: number, y: number): void;

  public _move(arg1: Pointable | number, arg2?: number) {
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
      this._move(goal);
      return true;
    } else {
      this._move(
        this.pos.x + available * Math.cos(remain.angle()),
        this.pos.y + available * Math.sin(remain.angle())
      );
      return false;
    }
  }

  public _fire() {
    console.warn("try to handle human");
  }

  /**
   * 指定されたホームが目前にあった場合で、降車するか返します
   * @param p
   */
  public _shouldGetOff(p: Platform) {
    return this.next === p;
  }

  /**
   * 指定された乗車タスクが目前にあった場合、乗車するか返します
   * @param lt
   */
  public _shuoldRide(lt: DeptTask) {
    return this.next === lt;
  }

  public _step() {
    if (this.next) this.next._fire(this);
  }

  public _complete() {
    // 運賃支払
    if (this.payment) {
      modelListener.add(EventType.SCORED, this.payment);
    }
    const prev = this.next;
    this.next = this.next.nextFor(this.destination);
    // 会社到着
    if (!this.next) {
      modelListener.add(EventType.SCORED, Human.COMPLETE_SCORE);
      modelListener.add(EventType.DELETED, this);
    }
    this.payment = prev.paymentFor(this.next);
  }
}

export default Human;
