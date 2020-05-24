import Human from "./human";
import LineTask from "./line_task";
import Point from "./point";
import { Pointable } from "./pointable";
import Train from "./train";

const DELTA = 0.0001;

abstract class TrainTask implements Pointable {
  protected isFirstExecute: boolean;
  protected progress: number;
  protected readonly train: Train;
  protected readonly onCompleted: () => void;

  constructor(train: Train, onCompleted: () => void) {
    this.train = train;
    this.progress = 0;
    this.onCompleted = onCompleted;
    this.isFirstExecute = true;
  }

  public abstract loc(): Point;

  public abstract _base(): LineTask;

  /**
   * このタスクの完了までにかかる時間を計算します
   */
  protected abstract estimate(): number;

  /**
   * 達成度を1にできる時間があるとき実施する処理
   * @param available
   */
  protected abstract onFullConsume(available: number): number;
  /**
   * 達成度を部分的に上げる時間があるとき実施する処理
   * @param available
   */
  protected abstract onPartialConsume(available: number): number;

  /**
   * 実際にタスクを消化し、残りの時間を返します
   * @param available
   */
  protected consume(available: number) {
    const strictRequired = this.estimate();
    // 浮動小数点の計算誤差があるため、極めて小さな値が残っていた場合、完了とする
    const remain =
      available > strictRequired - DELTA
        ? this.onFullConsume(available)
        : this.onPartialConsume(available);
    this.handleOnConsumed(available);
    return remain;
  }

  protected abstract isCompleted(): boolean;

  /**
   * 指定された時間内でタスクを消化し、残った時間を返します
   * 単位は秒
   * @param available
   */
  public _execute(available: number) {
    if (this.isFirstExecute) {
      this.handleOnInited();
      this.isFirstExecute = false;
    }
    const remain = this.consume(available);
    if (this.isCompleted()) this.onCompleted();
    return remain;
  }

  /**
   * タスクが開始されるときに実行されるハンドラ
   */
  protected abstract handleOnInited(): void;

  /**
   * 時間を消費したとき実行されるハンドラ
   */
  protected abstract handleOnConsumed(available: number): void;

  public abstract _giveup(subject: Human): void;
}
export default TrainTask;
