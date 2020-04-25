import modelListener, { EventType } from "./listener";
import RailLine from "./rail_line";
import RailNode from "./rail_node";

export const stationInterval = 50;

export enum ModelStateType {
  INITED,
  STARTED,
  FIXED,
}

export class UserResource {
  public readonly primaryLine: RailLine;
  private tailNode?: RailNode;
  private state: ModelStateType;
  public readonly stateListeners: {
    onStarted: (ev: UserResource) => void;
    onFixed: (ev: UserResource) => void;
    onReset: (ev: UserResource) => void;
  }[];
  /**
   * 駅を一定間隔で設置するため、最後に駅を持ってからextendした回数を保持するカウンター
   */
  private railCounter: number = 0;

  constructor() {
    this.primaryLine = new RailLine();
    this.state = ModelStateType.INITED;
    this.stateListeners = [];
  }

  private setState(state: ModelStateType) {
    switch (state) {
      case ModelStateType.INITED:
        this.state = ModelStateType.INITED;
        this.stateListeners.forEach((l) => l.onReset(this));
        break;
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
        modelListener.fire(EventType.CREATED);
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
        modelListener.fire(EventType.CREATED);
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
        modelListener.fire(EventType.CREATED);
        this.setState(ModelStateType.FIXED);
        break;
      case ModelStateType.FIXED:
        console.warn("try to end already fixed model");
        break;
    }
  }

  public reset() {
    this.primaryLine._reset();
    this.setState(ModelStateType.INITED);
  }
}

const userResource = new UserResource();

export default userResource;
