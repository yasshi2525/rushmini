import DeptTask from "./dept_task";
import Human, { HumanState } from "./human";
import Train from "./train";
import TrainTask from "./train_task";

const DELTA = 0.0001;

class StayTask extends TrainTask {
  private readonly base: DeptTask;
  /**
   * 降車待ちの人
   */
  private readonly outQueue: Human[];

  /**
   * 乗車待ちの人
   */
  private readonly inQueue: Human[];

  /**
   * 後、何秒待機すれば次の乗降を許可するか。
   * 移動タスクを秒単位で消費していくため、frameと同期がとれない。そのため秒単位で管理している
   */
  private waitSec: number;

  constructor(train: Train, base: DeptTask, onCompleted: () => void) {
    super(train, onCompleted);
    this.base = base;
    this.outQueue = [];
    this.inQueue = [];
    this.waitSec = 0;
  }

  public loc() {
    return this.base.departure().loc();
  }

  /**
   * 乗降客がまだプラットフォーム、車内に残っているか。
   * 残っている間は発車できない
   */
  protected isHumanRemained() {
    return this.inQueue.length + this.outQueue.length > 0;
  }

  protected isCompleted() {
    return this.progress >= 1 && !this.isHumanRemained();
  }

  protected estimate() {
    return Math.max((1 - this.progress) * Train.STAY_SEC, 0);
  }

  protected onFullConsume(available: number) {
    const cost = this.estimate();
    this.progress = 1;
    if (this.isHumanRemained()) {
      // 発車抑止
      return 0;
    }
    return available - cost;
  }

  protected onPartialConsume(available: number) {
    this.progress += available / Train.STAY_SEC;
    return 0;
  }

  /**
   * 電車が駅に到着した際、乗車客、降車客を確定させます。
   * 到着した瞬間にホームにいた客が対象
   */
  protected handleOnInited() {
    this.train.passengers
      .filter((h) => h._shouldGetOff(this.base.stay))
      .forEach((h) => this.outQueue.push(h));
    this.base
      ._queue()
      .filter((h) => h._shuoldRide(this.base))
      .forEach((h) => this.inQueue.push(h));
  }

  /**
   * 客を乗降させます
   * @param available
   */
  protected handleOnConsumed(available: number) {
    this.waitSec = Math.max(this.waitSec - available, 0);
    if (this.waitSec < 1 / Train.MOBILITY + DELTA) {
      const p = this.base.stay;
      const psngr = this.train.passengers;
      // 降車優先
      if (this.outQueue.length > 0) {
        // 乗車している利用客をホームに移動させる
        const h = this.outQueue.shift();
        h.state(HumanState.WAIT_EXIT_PLATFORM);
        p.outQueue.push(h);
        psngr.slice(psngr.indexOf(h), 1);
        this.waitSec += 1 / Train.MOBILITY;
      } else if (
        this.inQueue.length > 0 &&
        this.train.passengers.length < Train.CAPACITY
      ) {
        // ホームの利用客を電車に乗せる
        const h = this.inQueue.shift();
        h.state(HumanState.ON_TRAIN);
        h._complete();
        p.inQueue.slice(p.inQueue.indexOf(h), 1);
        this.train.passengers.push(h);
        this.waitSec += 1 / Train.MOBILITY;
      }
    }
  }

  public _base() {
    return this.base;
  }
}

export default StayTask;
