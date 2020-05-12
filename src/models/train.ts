import { remove } from "../utils/common";
import Human, { HumanState } from "./human";
import LineTask from "./line_task";
import modelListener, { EventType } from "./listener";
import { distance } from "./point";
import { Pointable } from "./pointable";
import RoutableObject, { Routable } from "./routable";
import { Steppable } from "./steppable";
import TrainExecutor from "./train_executor";

const DELTA = 0.0001;

class Train extends RoutableObject implements Pointable, Steppable, Routable {
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
  public static MOBILITY_SEC: number = 10;

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
    super();
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

  public _skip(to: LineTask) {
    this.executor.skip(to);
    modelListener.add(EventType.MODIFIED, this);
  }

  public _remove() {
    this.passengers.forEach((p) => {
      p._setTrain(undefined);
      p.state(HumanState.MOVE);
    });
    remove(this.current()._base().trains, this);
    modelListener.add(EventType.DELETED, this);
  }

  public _fire() {
    console.warn("try to handle train");
  }

  /**
   * 指定した人を電車から消去します (乗りかけ、降りかけ含む)
   * @param subject
   */
  public _giveup(subject: Human) {
    this.executor._giveup(subject);
  }

  public loc() {
    return this.executor.loc();
  }

  public current() {
    return this.executor.current();
  }
}

export default Train;
