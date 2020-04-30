import EdgeTask from "./edge_task";
import Point from "./point";
import Train from "./train";
import TrainTask from "./train_task";

class MoveTask extends TrainTask {
  public readonly base: EdgeTask;

  constructor(train: Train, base: EdgeTask, onCompleted: () => void) {
    super(train, onCompleted);
    this.base = base;
  }

  public loc() {
    const from = this.base.departure().loc();
    const to = this.base.desttination().loc();
    return new Point(
      (1 - this.progress) * from.x + this.progress * to.x,
      (1 - this.progress) * from.y + this.progress * to.y
    );
  }

  public isCompleted() {
    return this.progress >= 1;
  }

  public _base() {
    return this.base;
  }

  protected estimate() {
    return (1 - this.progress) * (this.base.length() / Train.SPEED);
  }

  protected onFullConsume(available: number) {
    const cost = this.estimate();
    this.progress = 1;
    return available - cost;
  }

  protected onPartialConsume(available: number) {
    this.progress += available * (Train.SPEED / this.base.length());
    return 0;
  }

  protected handleOnInited() {
    // do-nothing
  }

  protected handleOnConsumed() {
    const pos = this.loc();
    this.train.passengers.forEach((h) => h._move(pos.x, pos.y));
  }
}

export default MoveTask;
