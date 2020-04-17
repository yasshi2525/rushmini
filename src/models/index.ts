import RailLine from "./rail_line";
import RailNode from "./rail_node";
import modelListener from "./listener";

export const stationInterval = 50;

export enum ModelStateType {
  INITED,
  STARTED,
  FIXED,
}

export class Model {
  public readonly primaryLine: RailLine;
  private tailNode?: RailNode;
  private state: ModelStateType;
  public readonly stateListeners: {
    onStarted: (ev: Model) => void;
    onFixed: (ev: Model) => void;
  }[];
  /**
   * 駅を一定間隔で設置するため、最後に駅を持ってからextendした回数を保持するカウンター
   */
  private railCounter = 0;

  constructor() {
    this.primaryLine = new RailLine();
    this.state = ModelStateType.INITED;
    this.stateListeners = [];
  }

  private setState(state: ModelStateType.STARTED | ModelStateType.FIXED) {
    switch (state) {
      case ModelStateType.STARTED:
        this.state = ModelStateType.STARTED;
        this.stateListeners.forEach((l) => l.onStarted(this));
        break;
      case ModelStateType.FIXED:
        this.state = ModelStateType.FIXED;
        this.stateListeners.forEach((l) => l.onFixed(this));
        break;
    }
  }

  public getState() {
    return this.state;
  }

  /**
   * 指定された地点に駅を建設、路線を開始する
   * @param x
   * @param y
   */
  public start(x: number, y: number) {
    switch (this.state) {
      case ModelStateType.INITED:
        const rn = new RailNode(x, y);
        this.primaryLine._start(rn._buildStation());
        this.tailNode = rn;

        // 作成した結果を通知する
        modelListener.done();
        this.setState(ModelStateType.STARTED);
        break;
      case ModelStateType.STARTED:
        console.warn("try to start building model");
        break;
      case ModelStateType.FIXED:
        console.warn("try to start already fixed model");
        break;
    }
  }

  /**
   * 指定された地点に線路を延伸。路線も延伸する
   * @param x
   * @param y
   */
  public extend(x: number, y: number) {
    switch (this.state) {
      case ModelStateType.INITED:
        console.warn("try to extend init model");
        break;
      case ModelStateType.STARTED:
        const edge = this.tailNode._extend(x, y);

        // 一定間隔で駅を作成する
        this.railCounter++;
        if (this.railCounter >= stationInterval) {
          edge.to._buildStation();
          this.railCounter = 0;
        }

        this.primaryLine._insertEdge(edge);
        this.tailNode = edge.to;

        // 作成した結果を通知する
        modelListener.done();
        break;
      case ModelStateType.FIXED:
        console.warn("try to extend already fixed model");
        break;
    }
  }

  /**
   * 終点に駅を作成して終了する
   */
  public end() {
    switch (this.state) {
      case ModelStateType.INITED:
        console.warn("try to extend init model");
        break;
      case ModelStateType.STARTED:
        if (!this.tailNode.platform) {
          const p = this.tailNode._buildStation();
          this.primaryLine._insertPlatform(p);
        }

        // 作成した結果を通知する
        modelListener.done();
        this.setState(ModelStateType.FIXED);
        break;
      case ModelStateType.FIXED:
        console.warn("try to end already fixed model");
        break;
    }
  }
}

const model = new Model();

export default model;
