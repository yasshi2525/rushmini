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
import Train from "./train";

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
  DIED,
}

const DELTA = 0.000001;

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

  public static DESPAWN_SCORE: number = -10;

  /**
   * 何秒間歩き続けたらゲームから除外されるか
   */
  public static LIFE_SPAN: number = 8;
  /**
   * 歩いていない状態（ホーム、電車の中にいるなど）の場合、
   * 歩く場合の何倍の体力を消費するか
   */
  public static STAY_BUFF: number = 0.25;

  public readonly departure: Residence;
  public readonly destination: Company;

  /**
   * 残り体力。0-1
   */
  private stamina: number;

  /**
   * 次に向かう経由点
   */
  private next: Routable;
  /**
   * 降車時に払う運賃
   */
  private payment: number;

  private train: Train;

  constructor(departure: Residence, destination: Company) {
    super();
    this._state = HumanState.SPAWNED;
    this.stamina = 1;
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

  public _jump(p: Pointable): number;
  public _jump(x: number, y: number): number;

  /**
   * 指定した地点へワープする。戻り値は移動した距離
   * @param arg1
   * @param arg2
   */
  public _jump(arg1: Pointable | number, arg2?: number) {
    const prev = this.pos;
    if (typeof arg1 === "number") {
      this.pos = new Point(arg1, arg2);
    } else {
      this.pos = arg1.loc();
    }
    const result = distance(this.pos, prev);
    if (result > 0) {
      modelListener.add(EventType.MODIFIED, this);
    }
    return result;
  }

  /**
   * 指定した地点へ徒歩で移動する。戻り地は到達したかどうか
   * @param goal
   */
  public _seek(goal: Pointable) {
    const remain = substract(goal, this);
    const available = Human.SPEED / ticker.fps();
    if (available >= remain.length()) {
      // オーバーランを防ぐ
      this.damageByWalk(this._jump(goal));
      return true;
    } else {
      this.damageByWalk(
        this._jump(
          this.pos.x + available * Math.cos(remain.angle()),
          this.pos.y + available * Math.sin(remain.angle())
        )
      );
      return false;
    }
  }

  private damageByWalk(dist: number) {
    const time = dist / Human.SPEED;
    // stay の分まで引かないようにする
    this.stamina -= ((1 - Human.STAY_BUFF) * time) / Human.LIFE_SPAN;
  }

  private damageByStay(time: number) {
    this.stamina -= (Human.STAY_BUFF * time) / Human.LIFE_SPAN;
  }

  public _fire() {
    console.warn("try to handle human");
  }

  public _giveup() {
    console.warn("try to give up from human");
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

  public isOnTrain() {
    return this._state === HumanState.ON_TRAIN;
  }

  /**
   * 電車と紐付ける。死んだことを電車に通知するため。
   * 電車乗車中は nextが Platformのため、電車側が分からない
   * @param t
   */
  public setTrain(t?: Train) {
    this.train = t;
  }

  public _step() {
    this.next?._fire(this);

    // 会社についている場合、ダメージは喰らわない
    this.damageByStay(1 / ticker.fps());
    // 疲れ果てて死んだ
    if (this.stamina < -DELTA && this._state !== HumanState.DIED) this.dead();
  }

  /**
   * 死亡状態にし、関連タスクから自身を除外する。
   */
  private dead() {
    this._state = HumanState.DIED;
    this.next?._giveup(this);
    this.train?._giveup(this);
    modelListener.add(EventType.DELETED, this);
    modelListener.add(EventType.SCORED, Human.DESPAWN_SCORE);
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
