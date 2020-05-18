import ActionProxy from "./action";
import cityResource from "./city_resource";
import DeptTask from "./dept_task";
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
const SHORT_THRESHOLD = 100;

type StateListener = {
  onStarted?: (ev: UserResource) => void;
  onFixed?: (ev: UserResource) => void;
  onRollback?: (ev: UserResource) => void;
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
  public static STATION_INTERVAL: number = 250;
  public static TRAIN_INTERVAL: number = 500;
  private action: ActionProxy;

  private state: ModelState;
  private committed_state: ModelState;
  private committed_length: number;

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
   * 駅を一定間隔で設置するため、最後に駅を作ってからextendした距離を保持するカウンター
   */
  private distRail: number;
  private distTrain: number;

  constructor() {
    this.stateListeners = [];
  }

  public init() {
    this.distRail = 0;
    this.distTrain = 0;
    this.lastPos = undefined;
    this.setState(ModelState.INITED);
    this.committed_state = ModelState.INITED;
    this.committed_length = 0;
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
  private interviseStation(dist: number) {
    this.distRail += dist;
    if (this.distRail >= UserResource.STATION_INTERVAL) {
      this.action.buildStation();
      this.distRail = 0;
    }
  }

  /**
   * 一定間隔で電車を作成する
   */
  private interviseTrain(dist: number) {
    this.distTrain += dist;
    if (this.distTrain >= UserResource.TRAIN_INTERVAL) {
      this.action
        .line()
        .filter((lt) => lt.departure() === this.action.tail())
        .forEach((lt) => this.action.deployTrain(lt));
      this.distTrain = 0;
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
        const dist = this.action.extendRail(x, y);
        this.interviseStation(dist);

        this.action.insertEdge();
        this.interviseTrain(dist);

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
    this.distRail = 0;
    this.distTrain = 0;
    this.lastPos = undefined;
    this.action.startBranch(p);
    this.setState(ModelState.STARTED);
  }

  public reset() {
    this.state = ModelState.INITED;
    this.committed_state = ModelState.INITED;
    this.committed_length = 0;
    this.stateListeners.length = 0;
    this.distRail = 0;
    this.distTrain = 0;
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
    modelListener.fire(EventType.MODIFIED);
    this.setState(ModelState.FIXED);
  }

  public train() {
    this.action.increaseTrain();
    modelListener.fire(EventType.CREATED);
    modelListener.fire(EventType.MODIFIED);
  }

  public commit() {
    this.action.commit();
    this.committed_state = this.state;
    this.committed_length = this.action.line().length();
  }

  public rollback() {
    this.action.rollback();
    modelListener.fire(EventType.MODIFIED);
    modelListener.fire(EventType.DELETED);
    this.distRail = 0;
    this.distTrain = 0;
    this.setState(this.committed_state);
    this.stateListeners
      .filter((l) => l.onRollback)
      .forEach((l) => l.onRollback(this));
  }

  public shouldRollaback() {
    const diff = this.action.line().length() - this.committed_length;
    if (diff <= SHORT_THRESHOLD * 2) return true;
    // 電車を使う経路が存在しない場合もロールバックさせる
    for (let r of cityResource.rs) {
      for (let c of cityResource.cs) {
        if (r.nextFor(c) !== c) {
          return false;
        }
      }
    }
    return true;
  }
}

const userResource = new UserResource();

export default userResource;
