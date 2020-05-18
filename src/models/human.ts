import { ScoreEvent } from "../utils/scorer";
import ticker from "../utils/ticker";
import Company from "./company";
import DeptTask from "./dept_task";
import Gate from "./gate";
import modelListener, { EventType } from "./listener";
import Platform from "./platform";
import Point, { distance } from "./point";
import { Pointable, substract } from "./pointable";
import Residence from "./residence";
import RoutableObject, { Routable } from "./routable";
import { Steppable } from "./steppable";
import Train from "./train";

export enum HumanState {
  SPAWNED = "spawned",
  MOVE = "move",
  WAIT_ENTER_GATE = "wait_enter_gate",
  WAIT_ENTER_PLATFORM = "wait_enter_platform",
  WAIT_ENTER_DEPTQUEUE = "wait_enter_deptqueue",
  WAIT_TRAIN_ARRIVAL = "wait_train_arrival",
  WAIT_ENTER_TRAIN = "wait_enter_train",
  ON_TRAIN = "on_train",
  WAIT_EXIT_TRAIN = "wait_exit_train",
  WAIT_EXIT_PLATFORM = "wait_exit_platform",
  WAIT_EXIT_GATE = "wait_exit_gate",
  ARCHIVED = "archived",
  DIED = "died",
  WAIT_REROUTING = "wait_rerouting",
}

const DELTA = 0.000001;

class Human extends RoutableObject implements Steppable {
  private _state: HumanState;
  private pos: Point;
  /**
   * 1秒間に何pixcel進むか
   */
  public static SPEED: number = 50;

  public static DESPAWN_SCORE: number = -10;

  /**
   * 何秒間歩き続けたらゲームから除外されるか
   */
  public static LIFE_SPAN: number = 9;
  /**
   * 歩いていない状態（ホーム、電車の中にいるなど）の場合、
   * 歩く場合の何倍の体力を消費するか
   */
  public static STAY_BUFF: number = 0.1;

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

  private rideFrom: DeptTask;

  /**
   * 改札を出るときに支払う運賃
   */
  private payment: number;

  private gate: Gate;
  private platform: Platform;
  private dept: DeptTask;
  private train: Train;

  constructor(departure: Residence, destination: Company) {
    super();
    this._state = HumanState.SPAWNED;
    this.stamina = 1;
    this.pos = new Point(departure.loc());
    this.departure = departure;
    this.destination = destination;
    this.next = departure.nextFor(destination);
    this.payment = 0;
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
   * 次に向かっている目的地を返します
   */
  public _getNext() {
    return this.next;
  }

  public isOnTrain() {
    return this._state === HumanState.ON_TRAIN;
  }

  public _setGate(g?: Gate) {
    this.gate = g;
  }

  public _getGate() {
    return this.gate;
  }

  public _setPlatform(p?: Platform) {
    this.platform = p;
  }

  public _getPlatform() {
    return this.platform;
  }

  public _setDeptTask(dept?: DeptTask) {
    this.dept = dept;
  }

  public _getDeptTask() {
    return this.dept;
  }

  /**
   * 電車と紐付ける。死んだことを電車に通知するため。
   * 電車乗車中は nextが Platformのため、電車側が分からない
   * @param t
   */
  public _setTrain(t?: Train) {
    this.train = t;
  }

  public _getTrain() {
    return this.train;
  }

  public _reroute() {
    this.next = this.nextFor(this.destination);
  }

  public _step() {
    this.next?._fire(this);

    // 会社についている場合、ダメージは喰らわない
    this.damageByStay(1 / ticker.fps());
    // 疲れ果てて死んだ
    if (this.stamina < -DELTA && this._state !== HumanState.DIED) this.dead();
  }

  public _ride(dept: DeptTask) {
    this.rideFrom = dept;
  }

  public _getOff(platform: Platform) {
    this.payment += this.rideFrom.paymentFor(platform);
  }

  public _pay() {
    // 運賃支払い
    modelListener.add(EventType.CREATED, new ScoreEvent(this.payment, this));
    this.payment = 0;
  }

  /**
   * 死亡状態にし、関連タスクから自身を除外する。
   */
  private dead() {
    this._state = HumanState.DIED;
    this.next?._giveup(this);
    this.train?._giveup(this);
    modelListener.add(EventType.DELETED, this);
    modelListener.add(
      EventType.CREATED,
      new ScoreEvent(Human.DESPAWN_SCORE, this)
    );
  }

  public _complete() {
    const prev = this.next;
    this.next = this.next.nextFor(this.destination);
    // 会社到着
    if (!this.next) {
      modelListener.add(EventType.DELETED, this);
    }
  }
}

export default Human;
