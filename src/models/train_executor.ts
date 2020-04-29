import ticker from "../utils/ticker";
import DeptTask from "./dept_task";
import EdgeTask from "./edge_task";
import MoveTask from "./move_task";
import { Pointable } from "./pointable";
import StayTask from "./stay_task";
import { Steppable } from "./steppable";
import Train from "./train";
import TrainTask from "./train_task";

class TrainExecutor implements Steppable, Pointable {
  private readonly train: Train;
  private current: TrainTask;

  constructor(train: Train, initialTask: DeptTask) {
    this.train = train;
    this.current = new StayTask(train, initialTask, () => this.next());
  }

  public loc() {
    return this.current.loc();
  }

  public _step() {
    let remain = 1 / ticker.fps();
    while (remain > 0) {
      remain = this.current._execute(remain);
    }
  }

  private next() {
    const nxt = this.current._base().next;
    if (nxt.isDeptTask()) {
      this.current = new StayTask(this.train, nxt, () => this.next());
    } else {
      this.current = new MoveTask(this.train, nxt as EdgeTask, () =>
        this.next()
      );
    }
  }
}

export default TrainExecutor;
