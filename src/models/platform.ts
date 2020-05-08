import { remove, removeIf } from "../utils/common";
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

  /**
   * 自身を目的地とされた場合、移動者に指示を出します。
   * コンコース上にいる場合は入場を許可します
   * プラットフォーム上にいる場合は出場を許可します
   * @param subject
   */
  public _fire(subject: Human) {
    const gate = this.station.gate;

    // 駅入場者をプラットフォーム上にならばせる。
    if (
      gate._concourse.indexOf(subject) !== -1 &&
      this.inQueue.length < Platform.CAPACITY
    ) {
      remove(gate._concourse, subject);
      this.inQueue.push(subject);
      subject.state(HumanState.WAIT_ENTER_DEPTQUEUE);
      subject._complete();
      return;
    }

    // 到着した人を改札に向かわせる
    if (this.outQueue.indexOf(subject) !== -1) {
      remove(this.outQueue, subject);
      subject.state(HumanState.WAIT_EXIT_GATE);
      gate.outQueue.push(subject);
      subject._complete();
      return;
    }
  }

  public _giveup(subject: Human) {
    // コンコースからホームへの移動待ちの人を取り除く
    removeIf(this.station.gate._concourse, subject);
  }
}

export default Platform;
