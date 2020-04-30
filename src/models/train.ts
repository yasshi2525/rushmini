import Human from "./human";
import LineTask from "./line_task";
import modelListener, { EventType } from "./listener";
import { distance } from "./point";
import { Pointable } from "./pointable";
import { Steppable } from "./steppable";
import TrainExecutor from "./train_executor";

const DELTA = 0.0001;

class Train implements Pointable, Steppable {
  /**
   * 1秒間に何pixcel進むか
   */
  public static SPEED: number = 150;
  /**
   * 何人乗車できるか
   */
  public static CAPACITY: number = 100;
  /**
   * 一秒間に何人乗り降りできるか
   */
  public static MOBILITY: number = 10;

  /**
   * 最低何秒間駅に停車するか
   */
  public static STAY_SEC: number = 3;

  /**
   * 乗客
   */
  public readonly passengers: Human[];

  private readonly executor: TrainExecutor;

  constructor(current: LineTask) {
    this.passengers = [];
    this.executor = new TrainExecutor(this, current);
    modelListener.add(EventType.CREATED, this);
  }

  public _step() {
    const prev = this.loc();
    this.executor._step();
    if (distance(prev, this.loc()) > 0) {
      modelListener.add(EventType.MODIFIED, this);
    }
  }

  public loc() {
    return this.executor.loc();
  }

  public _current() {
    return this.executor._current()._base();
  }
}

export default Train;
