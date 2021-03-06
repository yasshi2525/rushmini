import { remove } from "../utils/common";
import ticker from "../utils/ticker";
import EdgeTask from "./edge_task";
import Human from "./human";
import LineTask from "./line_task";
import MoveTask from "./move_task";
import { Pointable } from "./pointable";
import StayTask from "./stay_task";
import { Steppable } from "./steppable";
import Train from "./train";
import TrainTask from "./train_task";

const newTask = (train: Train, lt: LineTask, onComplete: () => void) =>
  lt.isDeptTask()
    ? new StayTask(train, lt, onComplete)
    : new MoveTask(train, lt as EdgeTask, onComplete);

class TrainExecutor implements Steppable, Pointable {
  protected readonly train: Train;
  protected _current: TrainTask;

  constructor(train: Train, initialTask: LineTask) {
    this.train = train;

    this._current = newTask(train, initialTask, () => this.next());
  }

  public loc() {
    return this._current.loc();
  }

  public _step() {
    let remain = 1 / ticker.fps();
    while (remain > 0) {
      remain = this._current._execute(remain);
    }
  }

  public _giveup(subject: Human) {
    this._current._giveup(subject);
  }

  public current() {
    return this._current;
  }

  public skip(to: LineTask) {
    this._current = newTask(this.train, to, () => this.next());
  }

  protected next() {
    remove(this._current._base().trains, this.train);
    const nxt = this._current._base().next;
    this._current = newTask(this.train, nxt, () => this.next());
  }
}

export default TrainExecutor;
