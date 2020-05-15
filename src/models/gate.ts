import { remove, removeIf } from "../utils/common";
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
  /**
   * 改札内に入りたい人たち
   */
  public readonly inQueue: Human[];
  /**
   * プラットフォームへの入場待機者
   * デッドロックを防ぐため、出場者はホームから容量無制限の outQueue に移動させる
   */
  public readonly _concourse: Human[];
  /**
   * コンコースから改札外に出たい人達
   */
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

  public _remove() {
    modelListener.add(EventType.DELETED, this);
  }

  /**
   * 入場待ちをプラットフォーム移動待ちにさせます
   * 一人移動できたなら、trueを返します
   */
  private tryEnter() {
    // 入場規制
    if (this._concourse.length >= Gate.CAPACITY) {
      return false;
    }
    while (this.inQueue.length > 0) {
      const h = this.inQueue.shift();
      // 途中で再経路探索され、目的地が変わった場合は無視
      // => 必ず h.step()でコンコースに
      if (h._getNext() === this && this.outQueue.indexOf(h) === -1) {
        h._complete();
        this._concourse.push(h);
        h.state(HumanState.WAIT_ENTER_PLATFORM);
        h._setGate(this);
        this.waitFrame += ticker.fps() / Gate.MOBILITY_SEC;
        return true;
      } else {
        h.state(HumanState.MOVE);
      }
    }
    return false;
  }

  /**
   * 出場待ちを改札外に移動させます。
   * 一人移動できたなら、trueを返します
   */
  private tryExit() {
    let ignoreCnt = 0;
    while (this.outQueue.length > 0 && this.outQueue.length > ignoreCnt) {
      const h = this.outQueue.shift();

      if (h._getNext() === this) {
        h._setGate(undefined);
        h._complete();
        h.state(HumanState.MOVE);
        this.waitFrame += ticker.fps() / Gate.MOBILITY_SEC;
        return true;
      } else {
        // 途中で再経路探索され、目的地が変わった場合は無視
        this.outQueue.push(h);
        ignoreCnt++;
      }
    }
    return false;
  }

  /**
   * 入出場待ちがいる場合、改札を通して移動させます。
   * プラットフォーム移動待ちが満杯の場合、入場規制します
   * 人を移動させた場合、ペナルティとして待機時間を増やします。
   */
  public _step() {
    this.waitFrame = Math.max(this.waitFrame - 1, 0);
    if (this.waitFrame === 0) {
      if (!this.tryExit()) this.tryEnter();
    }
  }

  /**
   * 自身を目的地とされた場合、移動者に対して指示を出します。
   * 外にいる場合、自身まで移動させます。到着した場合、入場列に並ばせます。
   * プラットフォームから出たい移動者は _step() で処理します (改札数のキャパシティ制約を受けるため)
   * @param subject
   */
  public _fire(subject: Human) {
    // コンコースに入ったが、目的地が変わり出場することになった
    if (this._concourse.indexOf(subject) !== -1) {
      remove(this._concourse, subject);
      this.outQueue.push(subject);
      subject.state(HumanState.WAIT_EXIT_GATE);
      return;
    }

    // 待機列にいるならば人を待たせる
    if (
      this.outQueue.indexOf(subject) !== -1 ||
      this.inQueue.indexOf(subject) !== -1
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

  public _giveup(subject: Human) {
    // 改札に入りたかった人を取り除く。改札へ移動中の人の場合何もしない
    removeIf(this.inQueue, subject);
    // 改札を出たかった人を取り除く
    removeIf(this.outQueue, subject);
  }
}

export default Gate;
