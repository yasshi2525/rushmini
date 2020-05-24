import { remove, removeIf, sum } from "../utils/common";
import DeptTask from "./dept_task";
import Gate from "./gate";
import Human, { HumanState } from "./human";
import modelListener, { EventType } from "./listener";
import RailNode from "./rail_node";
import RoutableObject from "./routable";
import Station from "./station";

class Platform extends RoutableObject {
  public static CAPACITY: number = 20;

  public readonly on: RailNode;
  public readonly station: Station;
  /**
   * プラットフォームで、電車待機列に入るのを待機している人
   */
  public readonly inQueue: Human[];
  /**
   * 電車から降りた人
   */
  public readonly outQueue: Human[];

  public readonly depts: DeptTask[];

  constructor(on: RailNode, st: Station) {
    super();
    this.on = on;
    this.station = st;
    this.inQueue = [];
    this.outQueue = [];
    this.depts = [];
    on.platform = this;
    st.platforms.push(this);
    modelListener.add(EventType.CREATED, this);
  }

  /**
   * ホーム上にいる人数を返します
   */
  public numUsed() {
    return this.inQueue.length + sum(this.depts, (d) => d._queue().length);
  }

  public loc() {
    return this.on.loc();
  }

  public _remove() {
    this.on.platform = undefined;
    modelListener.add(EventType.MODIFIED, this.on);
    modelListener.add(EventType.DELETED, this);
  }

  /**
   * 乗車列にならんでいたが、経路再探索で別のホーム/改札への移動が決まった
   * @param subject
   */
  protected tryLeaveDeptQueue(subject: Human) {
    if (subject._getDeptTask()) {
      remove(subject._getDeptTask()._queue(), subject);
      subject.state(HumanState.WAIT_EXIT_PLATFORM);
      subject._setTrain(undefined);
      subject._setDeptTask(undefined);
      subject._setPlatform(this);
      this.outQueue.push(subject);
      return true;
    }
    return false;
  }

  /**
   * ホームへ移動するときだったが、経路再探索で別のホーム/改札への移動が決まった
   * @param subject
   */
  protected tryLeaveInQueue(subject: Human) {
    if (this.inQueue.indexOf(subject) !== -1) {
      remove(this.inQueue, subject);
      subject.state(HumanState.WAIT_EXIT_PLATFORM);
      this.outQueue.push(subject);
      return true;
    }
    return false;
  }

  /**
   * 改札に向かっていたが経路再探索でホーム入場にかわった
   * @param subject
   */
  protected tryLeaveOutQueue(subject: Human) {
    const gate = this.station.gate;
    if (gate.outQueue.indexOf(subject) !== -1) {
      // コンコースに行きたいが満員で移動できない
      if (gate._concourse.length >= Gate.CAPACITY) {
        return true;
      }
      remove(gate.outQueue, subject);
      gate._concourse.push(subject);
      subject.state(HumanState.WAIT_ENTER_PLATFORM);
      subject._setPlatform(undefined);
      subject._setGate(gate);
      return true;
    }
    return false;
  }

  /**
   * 駅入場者をプラットフォーム上にならばせる。
   * @param subject
   */
  protected tryInQueue(subject: Human) {
    const gate = this.station.gate;
    if (
      gate._concourse.indexOf(subject) !== -1 &&
      this.numUsed() < Platform.CAPACITY
    ) {
      remove(gate._concourse, subject);
      subject._setGate(undefined);
      subject._complete();
      this.inQueue.push(subject);
      // 満員になったら通知
      if (this.numUsed() === Platform.CAPACITY) {
        modelListener.add(EventType.MODIFIED, this.station);
      }
      subject.state(HumanState.WAIT_ENTER_DEPTQUEUE);
      subject._setPlatform(this);
      return true;
    }
    return false;
  }

  /**
   * 到着した人を改札/コンコースに向かわせる
   * @param subject
   */
  protected tryOutQueue(subject: Human) {
    const gate = this.station.gate;
    if (this.outQueue.indexOf(subject) !== -1) {
      remove(this.outQueue, subject);
      if (subject._getNext().nextFor(subject.destination) === gate) {
        // 到着した人を改札に向かわせる
        subject._complete();
        subject.state(HumanState.WAIT_EXIT_GATE);

        gate.outQueue.push(subject);
      } else {
        // 乗り換えの場合、次の次がDeptTask
        subject.state(HumanState.WAIT_ENTER_PLATFORM);
        gate._concourse.push(subject);
      }
      subject._setPlatform(undefined);
      subject._setGate(gate);

      return true;
    }
    return false;
  }

  /**
   * 自身を目的地とされた場合、移動者に指示を出します。
   * コンコース上にいる場合は入場を許可します
   * プラットフォーム上にいる場合は出場を許可します
   * @param subject
   */
  public _fire(subject: Human) {
    if (!this.tryLeaveDeptQueue(subject))
      if (!this.tryLeaveInQueue(subject))
        if (!this.tryLeaveOutQueue(subject))
          if (!this.tryInQueue(subject)) this.tryOutQueue(subject);
  }

  public _giveup(subject: Human) {
    // コンコースからホームへの移動待ちの人を取り除く
    removeIf(this.station.gate._concourse, subject);
  }
}

export default Platform;
