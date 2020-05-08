import { remove, removeIf } from "../utils/common";
import Human, { HumanState } from "./human";
import LineTask from "./line_task";
import { _createTask } from "./line_task_utils";
import modelListener, { EventType } from "./listener";
import Platform from "./platform";
import RailEdge from "./rail_edge";
import RailLine from "./rail_line";
import RoutableObject, { Routable } from "./routable";

/**
 * 列車移動のための乗車タスクを経路中継点で表したもの
 */
class DeptTaskRouter extends RoutableObject {
  readonly queue: Human[];
  private readonly parent: DeptTask;

  constructor(parent: DeptTask) {
    super();
    this.parent = parent;
    this.queue = [];
  }

  /**
   * プラットフォームで電車を待っているならば、乗車待ちリストに登録します
   * @param subject
   */
  public _fire(subject: Human) {
    if (this.queue.indexOf(subject) !== -1) {
      return;
    }
    subject.state(HumanState.WAIT_TRAIN_ARRIVAL);
    const p = this.parent.stay;
    remove(p.inQueue, subject);
    this.queue.push(subject);
  }

  public _giveup(subject: Human) {
    // ホームにおり、発車待機列に並ぶのを待っていた人を取り除く
    // 次のframeで _fireがコールされる人が該当
    removeIf(this.parent.stay.inQueue, subject);
    // 電車の待機者を取り除く
    removeIf(this.queue, subject);
  }
}

export class DeptTask extends LineTask implements Routable {
  private readonly router: DeptTaskRouter;
  public readonly stay: Platform;

  constructor(parent: RailLine, stay: Platform, prev?: LineTask) {
    super(parent, prev) /* istanbul ignore next */;
    this.router = new DeptTaskRouter(this);
    this.stay = stay;
    modelListener.add(EventType.CREATED, this);
  }

  public isDeptTask() {
    return true;
  }

  public departure() {
    return this.stay.on;
  }

  public destination() {
    return this.stay.on;
  }

  /**
   * 直前の長さ0以上の移動タスクから、引数の線路への回転角を求める
   * @param edge
   */
  public _angle(edge: RailEdge) {
    if (!this._isNeighbor(edge)) {
      console.warn("could not calculate angle to un-neighbored edge");
      return NaN;
    }
    let prev = this.prev;
    while (prev !== this) {
      if (prev.length() > 0) {
        return prev._angle(edge);
      }
      prev = prev.prev;
    }
    console.warn("line has no edge task");
    return NaN;
  }

  public length() {
    return 0;
  }

  public _isNeighbor(edge: RailEdge) {
    return this.stay.on === edge.from;
  }

  /**
   * 現在地点で路線を分断し、指定された往復路を路線タスクに挿入します
   * Before (a) = (a) -> (b)
   * After  (a) = (a) -> (X) -> (a) -> (a) -> (b)
   * * edge : (a) -> (X)
   * @param edge
   */
  public _insertEdge(edge: RailEdge) {
    const next = this.next; // (a) -> (b)
    const inbound = _createTask(this, edge);
    if (inbound) {
      if (this !== next) {
        // 自身が発車タスクなので、復路の後の発車タスクを追加する
        const dept = new DeptTask(this.parent, this.stay, inbound); // (a) -> (a)
        dept.next = next; // (a) -> (b) -> (c)
        next.prev = dept;
      } else {
        // 単体dept(セルフループ)の場合は例外で発車タスクをつけない
        inbound.next = next;
        next.prev = inbound;
      }
    }
  }

  public _insertPlatform(platform: Platform) {
    console.warn("try to insert platform to DeptTask");
  }

  public _fire(subject: Human) {
    this.router._fire(subject);
  }

  public _giveup(subject: Human) {
    this.router._giveup(subject);
  }

  public _setNext(
    next: RoutableObject,
    goal: RoutableObject,
    cost: number,
    payment: number = 0
  ) {
    return this.router._setNext(next, goal, cost, payment);
  }

  public nextFor(goal: RoutableObject) {
    return this.router.nextFor(goal);
  }

  public distanceFor(goal: RoutableObject) {
    return this.router.distanceFor(goal);
  }

  public paymentFor(goal: RoutableObject) {
    return this.router.paymentFor(goal);
  }

  public _queue() {
    return this.router.queue;
  }
}
export default DeptTask;
