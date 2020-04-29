import DeptTask from "./dept_task";
import Human from "./human";
import modelListener, { EventType } from "./listener";
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

  constructor(current: DeptTask) {
    this.passengers = [];
    this.executor = new TrainExecutor(this, current);
    modelListener.add(EventType.CREATED, this);
  }

  public _step() {
    this.executor._step();
  }

  public loc() {
    return this.executor.loc();
  }
}

export default Train;
