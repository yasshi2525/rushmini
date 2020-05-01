import ticker from "../utils/ticker";
import Human, { HumanState } from "./human";
import modelListener, { EventType } from "./listener";
import { Pointable } from "./pointable";
import RoutableObject from "./routable";
import Station from "./station";
import { Steppable } from "./steppable";

class Gate extends RoutableObject implements Pointable, Steppable {
  public readonly station: Station;
  /**
   * 1秒間に通過できる人数
   */
  public static MOBILITY_SEC: number = 5;
  /**
   * ホームへの入場待ち者が入れる最大数
   */
  public static CAPACITY: number = 20;
  /**
   * 後、どれくらいのフレーム数経過すれば、人が1人通れるか
   */
  private waitFrame: number;
  public readonly inQueue: Human[];
  /**
   * プラットフォームへの入場待機者
   */
  public readonly _concourse: Human[];
  public readonly outQueue: Human[];

  constructor(st: Station) {
    super();
    this.station = st;
    this.inQueue = [];
    this._concourse = [];
    this.outQueue = [];
    this.waitFrame = 0;
    modelListener.add(EventType.CREATED, this);
  }

  public loc() {
    return this.station.loc();
  }

  /**
   * 入出場待ちがいる場合、改札を通して移動させます。
   * プラットフォーム移動待ちが満杯の場合、入場規制します
   * 人を移動させた場合、ペナルティとして待機時間を増やします。
   */
  public _step() {
    if (this.waitFrame > 0) {
      this.waitFrame = Math.max(this.waitFrame - 1, 0);
    } else {
      if (this.outQueue.length > 0) {
        // 出場待ちを改札外に移動させる
        const h = this.outQueue.shift();
        h.state(HumanState.MOVE);
        h._complete();
        this.waitFrame += ticker.fps() / Gate.MOBILITY_SEC;
      } else if (
        this.inQueue.length > 0 &&
        this._concourse.length < Gate.CAPACITY // 入場規制
      ) {
        // 入場待ちをプラットフォーム移動待ちにする
        const h = this.inQueue.shift();
        this._concourse.push(h);
        h.state(HumanState.WAIT_ENTER_PLATFORM);
        h._complete();
        this.waitFrame += ticker.fps() / Gate.MOBILITY_SEC;
      }
    }
  }

  /**
   * 自身を目的地とされた場合、移動者に対して指示を出します。
   * 外にいる場合、自身まで移動させます。到着した場合、入場列に並ばせます。
   * プラットフォームから出たい移動者は _step() で処理します (改札数のキャパシティ制約を受けるため)
   * @param subject
   */
  public _fire(subject: Human) {
    // 待機列にいるならば人を待たせる
    if (
      this.outQueue.some((h) => h === subject) ||
      this.inQueue.some((h) => h === subject)
    ) {
      return;
    }

    // 地面を歩いているならば、自身に向かって移動させる
    if (subject._seek(this)) {
      // 到着したならば、入場待機列に移動させる
      this.inQueue.push(subject);
      subject.state(HumanState.WAIT_ENTER_GATE);
    } else {
      subject.state(HumanState.MOVE);
    }
  }
}

export default Gate;
