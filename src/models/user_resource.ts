import ActionProxy from "./action";
import modelListener, { EventType } from "./listener";
import Platform from "./platform";
import Point, { distance } from "./point";
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
  private action: ActionProxy;

  private state: ModelState;

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
    this.state = ModelState.INITED;
    this.stateListeners = [];
    this.lastPos = undefined;
    this.action = new ActionProxy();
  }

  private setState(state: ModelState) {
    this.state = state;
    this.stateListeners
      .map((l) => find(state, l))
      .filter((fn) => fn)
      .forEach((fn) => fn(this));
  }

  public getPrimaryLine() {
    return this.action.line();
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
        this.action.startRail(x, y);
        this.action.buildStation();
        this.action.startLine();
        this.action.deployTrain(this.action.line().top);
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
  private interviseStation() {
    this.railCounter++;
    if (this.railCounter >= UserResource.STATION_INTERVAL) {
      this.action.buildStation();
      this.railCounter = 0;
    }
  }

  /**
   * 一定間隔で電車を作成する
   */
  private interviseTrain() {
    this.trainCounter++;
    if (this.trainCounter >= UserResource.TRAIN_INTERVAL) {
      this.action
        .line()
        .filter((lt) => lt.departure() === this.action.tail())
        .forEach((lt) => this.action.deployTrain(lt));
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
          distance(this.action.tail().loc(), this.lastPos) <
          UserResource.DIST - DELTA
        ) {
          return;
        }
        this.action.extendRail(x, y);
        this.interviseStation();

        this.action.insertEdge();
        this.interviseTrain();

        // 作成した結果を通知する
        modelListener.fire(EventType.CREATED);
        modelListener.fire(EventType.MODIFIED);
        break;
      case ModelState.FIXED:
        console.warn("try to extend already fixed model");
        break;
    }
  }

  private insertTerminal() {
    // 建設抑止していた場合、最後にクリックした地点まで延伸する
    if (this.lastPos && distance(this.lastPos, this.action.tail().loc()) > 0) {
      this.action.extendRail(this.lastPos.x, this.lastPos.y);
      this.action.insertEdge();
    }
    // 終点に駅をつくる
    if (!this.action.tail().platform) {
      this.action.buildStation();
      this.action.insertPlatform();
      this.action.deployTrain(
        this.action
          .line()
          .filter(
            (lt) => lt.isDeptTask() && lt.stay === this.action.tail().platform
          )[0]
      );
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
        this.insertTerminal();
        // 作成した結果を通知する
        modelListener.fire(EventType.CREATED);
        modelListener.fire(EventType.MODIFIED);
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
      this.action.line().filter((lt) => lt.departure().platform === p)
        .length === 0
    ) {
      console.warn("try to branch from unrelated platform");
      return;
    }

    this.action.startBranch(p);
    this.setState(ModelState.STARTED);
  }

  public reset() {
    this.action = new ActionProxy();
    this.lastPos = undefined;
    this.setState(ModelState.INITED);
  }

  public station(rn: RailNode) {
    if (this.state !== ModelState.FIXED) {
      console.warn("try to station unfixed model");
      return;
    }
    if (this.action.line().filter((lt) => lt.departure() === rn).length === 0) {
      console.warn("try to station from unrelated rail node");
      return;
    }
    this.action.buildStation(rn);
    this.action.insertPlatform(rn.platform);
    modelListener.fire(EventType.CREATED);
  }

  public commit() {
    this.action.commit();
  }

  public rollback() {
    this.action.rollback();
    modelListener.fire(EventType.MODIFIED);
    modelListener.fire(EventType.DELETED);
    this.setState(ModelState.FIXED);
  }
}

const userResource = new UserResource();

export default userResource;
