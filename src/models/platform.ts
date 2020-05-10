import { remove, removeIf } from "../utils/common";
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
  readonly outQueue: Human[];

  constructor(on: RailNode, st: Station) {
    super();
    this.on = on;
    this.station = st;
    this.inQueue = [];
    this.outQueue = [];
    on.platform = this;
    st.platforms.push(this);
    modelListener.add(EventType.CREATED, this);
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
   * 自身を目的地とされた場合、移動者に指示を出します。
   * コンコース上にいる場合は入場を許可します
   * プラットフォーム上にいる場合は出場を許可します
   * @param subject
   */
  public _fire(subject: Human) {
    const gate = this.station.gate;
    // 乗車列にならんでいたが、経路再探索で別のホーム/改札への移動が決まった
    if (subject._getDeptTask()) {
      remove(subject._getDeptTask()._queue(), subject);
      subject.state(HumanState.WAIT_EXIT_PLATFORM);
      subject._setTrain(undefined);
      subject._setDeptTask(undefined);
      subject._setPlatform(this);
      this.outQueue.push(subject);
      return;
    }

    // ホームへ移動するときだったが、経路再探索で別のホーム/改札への移動が決まった
    if (this.inQueue.indexOf(subject) !== -1) {
      remove(this.inQueue, subject);
      subject.state(HumanState.WAIT_EXIT_PLATFORM);
      this.outQueue.push(subject);
      return;
    }

    // 改札に向かっていたが経路再探索でホーム入場にかわった
    if (gate.outQueue.indexOf(subject) !== -1) {
      // コンコースに行きたいが満員で移動できない
      if (gate._concourse.length >= Gate.CAPACITY) {
        return;
      }
      remove(gate.outQueue, subject);
      gate._concourse.push(subject);
      subject.state(HumanState.WAIT_ENTER_PLATFORM);
      subject._setPlatform(undefined);
      subject._setGate(gate);
      return;
    }

    // 駅入場者をプラットフォーム上にならばせる。
    if (
      gate._concourse.indexOf(subject) !== -1 &&
      this.inQueue.length < Platform.CAPACITY
    ) {
      remove(gate._concourse, subject);
      subject._setGate(undefined);
      subject._complete();
      this.inQueue.push(subject);
      subject.state(HumanState.WAIT_ENTER_DEPTQUEUE);
      subject._setPlatform(this);
      return;
    }

    if (this.outQueue.indexOf(subject) !== -1) {
      remove(this.outQueue, subject);
      subject._complete();

      if (subject._getNext() === gate) {
        // 到着した人を改札に向かわせる
        subject.state(HumanState.WAIT_EXIT_GATE);

        gate.outQueue.push(subject);
      } else {
        // 乗り換えの人をコンコースに向かわせる
        subject.state(HumanState.WAIT_ENTER_PLATFORM);
        gate._concourse.push(subject);
      }
      subject._setPlatform(undefined);
      subject._setGate(gate);

      return;
    }
  }

  public _giveup(subject: Human) {
    // コンコースからホームへの移動待ちの人を取り除く
    removeIf(this.station.gate._concourse, subject);
  }
}

export default Platform;
