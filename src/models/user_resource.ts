import modelListener, { EventType } from "./listener";
import Platform from "./platform";
import Point, { distance } from "./point";
import RailEdge from "./rail_edge";
import RailLine from "./rail_line";
import RailNode from "./rail_node";
import Train from "./train";

export enum ModelState {
  INITED,
  STARTED,
  FIXED,
}

const DELTA = 0.0001;

type StateListener = {
  onStarted?: (ev: UserResource) => void;
  onFixed?: (ev: UserResource) => void;
  onReset?: (ev: UserResource) => void;
};

const find = (state: ModelState, l: StateListener) => {
  switch (state) {
    case ModelState.INITED:
      return l.onReset;
    case ModelState.STARTED:
      return l.onStarted;
    case ModelState.FIXED:
      return l.onFixed;
  }
};

export class UserResource {
  public static STATION_INTERVAL: number = 50;
  public static TRAIN_INTERVAL: number = 100;

  private primaryLine: RailLine;
  private tailNode?: RailNode;
  private state: ModelState;
  private ts: Train[];

  /**
   * 最低この距離離れないと、RailEdgeを作成しない (じぐざぐ防止)
   */
  public static DIST: number = 10;

  /**
   * end() 時に、このポイントまで伸ばす
   */
  private lastPos: Point;

  public readonly stateListeners: StateListener[];

  /**
   * 駅を一定間隔で設置するため、最後に駅を持ってからextendした回数を保持するカウンター
   */
  private railCounter: number = 0;
  private trainCounter: number = 0;

  constructor() {
    this.primaryLine = new RailLine();
    this.ts = [];
    this.state = ModelState.INITED;
    this.stateListeners = [];
    this.lastPos = undefined;
  }

  private setState(state: ModelState) {
    this.state = state;
    this.stateListeners
      .map((l) => find(state, l))
      .filter((fn) => fn)
      .forEach((fn) => fn(this));
  }

  public getPrimaryLine() {
    return this.primaryLine;
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
      case ModelState.INITED:
        const rn = new RailNode(x, y);
        this.primaryLine._start(rn._buildStation());
        this.tailNode = rn;
        this.ts.push(new Train(this.primaryLine.top));
        // 作成した結果を通知する
        modelListener.fire(EventType.CREATED);
        this.setState(ModelState.STARTED);
        break;
      case ModelState.STARTED:
        console.warn("try to start building model");
        break;
      case ModelState.FIXED:
        console.warn("try to start already fixed model");
        break;
    }
  }

  /**
   * 一定間隔で駅を作成する
   */
  private interviseStation(edge: RailEdge) {
    this.railCounter++;
    if (this.railCounter >= UserResource.STATION_INTERVAL) {
      edge.to._buildStation();
      this.railCounter = 0;
    }
  }

  /**
   * 一定間隔で電車を作成する
   */
  private interviseTrain() {
    this.trainCounter++;
    if (this.trainCounter >= UserResource.TRAIN_INTERVAL) {
      this.primaryLine
        .filter((lt) => lt.departure() === this.tailNode)
        .forEach((lt) => this.ts.push(new Train(lt)));
      this.trainCounter = 0;
    }
  }

  /**
   * 指定された地点に線路を延伸。路線も延伸する
   * @param x
   * @param y
   */
  public extend(x: number, y: number) {
    switch (this.state) {
      case ModelState.INITED:
        console.warn("try to extend init model");
        break;
      case ModelState.STARTED:
        // 近い距離でつくってしまうとじぐざぐするのでスキップする
        this.lastPos = new Point(x, y);
        if (
          distance(this.tailNode.loc(), this.lastPos) <
          UserResource.DIST - DELTA
        ) {
          return;
        }
        const edge = this.tailNode._extend(x, y);
        this.interviseStation(edge);

        this.primaryLine._insertEdge(edge);
        this.tailNode = edge.to;

        this.interviseTrain();

        // 作成した結果を通知する
        modelListener.fire(EventType.CREATED);
        break;
      case ModelState.FIXED:
        console.warn("try to extend already fixed model");
        break;
    }
  }

  /**
   * 終点に駅を作成して終了する
   */
  public end() {
    switch (this.state) {
      case ModelState.INITED:
        console.warn("try to extend init model");
        break;
      case ModelState.STARTED:
        if (this.lastPos && distance(this.lastPos, this.tailNode.loc()) > 0) {
          const edge = this.tailNode._extend(this.lastPos.x, this.lastPos.y);
          this.primaryLine._insertEdge(edge);
          this.tailNode = edge.to;
        }
        if (!this.tailNode.platform) {
          const p = this.tailNode._buildStation();
          this.primaryLine._insertPlatform(p);
          this.ts.push(
            new Train(
              this.primaryLine.filter(
                (lt) => lt.isDeptTask() && lt.stay === p
              )[0]
            )
          );
        }

        // 作成した結果を通知する
        modelListener.fire(EventType.CREATED);
        this.setState(ModelState.FIXED);
        break;
      case ModelState.FIXED:
        console.warn("try to end already fixed model");
        break;
    }
  }

  public branch(p: Platform) {
    if (this.state !== ModelState.FIXED) {
      console.warn("try to branch unfixed model");
      return;
    }
    if (
      this.primaryLine.filter((lt) => lt.departure().platform === p).length ===
      0
    ) {
      console.warn("try to branch from unrelated platform");
      return;
    }

    this.tailNode = p.on;

    modelListener.fire(EventType.CREATED);
    this.setState(ModelState.STARTED);
  }

  public reset() {
    this.primaryLine = new RailLine();
    this.setState(ModelState.INITED);
    this.lastPos = undefined;
  }

  public station(rn: RailNode) {
    if (this.state !== ModelState.FIXED) {
      console.warn("try to station unfixed model");
      return;
    }
    if (this.primaryLine.filter((lt) => lt.departure() === rn).length === 0) {
      console.warn("try to station from unrelated rail node");
      return;
    }
    const p = rn._buildStation();
    this.primaryLine._insertPlatform(p);
    modelListener.fire(EventType.CREATED);
  }
}

const userResource = new UserResource();

export default userResource;
