import LineTask from "./line_task";
import Platform from "./platform";
import RailEdge from "./rail_edge";
import RailLine from "./rail_line";
import RailNode from "./rail_node";
import Train from "./train";

export interface Transactional {
  rollback(): void;
}

class StartRailAction implements Transactional {
  private readonly prevTail: RailNode;
  private readonly rollbackFn: (rn: RailNode) => void;
  private rn: RailNode;

  constructor(prevTail: RailNode, rollbackFn: (prevTail: RailNode) => void) {
    this.prevTail = prevTail;
    this.rollbackFn = rollbackFn;
  }

  act(x: number, y: number) {
    this.rn = new RailNode(x, y);
    return this.rn;
  }

  rollback() {
    this.rollbackFn(this.prevTail);
    this.rn._remove();
  }
}

class BuildStationAction implements Transactional {
  private readonly prevTail: RailNode;
  private readonly rollbackFn: (rn: RailNode) => void;
  private p: Platform;

  constructor(tail: RailNode, rollbackFn: (prevTail: RailNode) => void) {
    this.prevTail = tail;
    this.rollbackFn = rollbackFn;
  }

  act(rn?: RailNode) {
    this.p = rn ? rn._buildStation() : this.prevTail._buildStation();
    return this.p;
  }

  rollback() {
    this.rollbackFn(this.prevTail);
    this.p.station.gate._remove();
    this.p.station._remove();
    this.p._remove();
  }
}

class ExtendRailAction implements Transactional {
  private readonly prevTail: RailNode;
  private readonly rollbackFn: (rn: RailNode) => void;
  private re: RailEdge;

  constructor(prevTail: RailNode, rollbackFn: (prevTail: RailNode) => void) {
    this.prevTail = prevTail;
    this.rollbackFn = rollbackFn;
  }

  act(x: number, y: number) {
    this.re = this.prevTail._extend(x, y);
    return this.re;
  }

  rollback() {
    this.rollbackFn(this.prevTail);
    this.re.to._remove();
    this.re._remove();
    this.re.reverse._remove();
  }
}

class StartLineAction implements Transactional {
  private readonly l: RailLine;

  constructor(l: RailLine) {
    this.l = l;
  }

  act(p: Platform) {
    this.l._start(p);
  }

  rollback() {
    this.l.top._remove();
    this.l.top = undefined;
  }
}

class InsertEdgeAction implements Transactional {
  private readonly l: RailLine;
  private pivot: LineTask;
  private prevNext: LineTask;

  constructor(l: RailLine) {
    this.l = l;
  }

  act(re: RailEdge) {
    [this.pivot, this.prevNext] = this.l._insertEdge(re);
  }

  rollback() {
    this.pivot._shrink(this.prevNext);
  }
}

class InsertPlatformAction implements Transactional {
  private readonly l: RailLine;
  private p: Platform;

  constructor(l: RailLine) {
    this.l = l;
  }

  act(p: Platform) {
    this.p = p;
    this.l._insertPlatform(p);
  }

  rollback() {
    this.l
      .filter((lt) => lt.isDeptTask() && lt.stay === this.p)
      .forEach((dept) => {
        dept.prev._shrink(dept.next);
      });
  }
}

class DeployTrainAction implements Transactional {
  private t: Train;

  act(lt: LineTask) {
    const t = new Train(lt);
    this.t = t;
    return t;
  }

  rollback() {
    this.t._remove();
  }
}

class StartBranchAction {
  private readonly prevTail: RailNode;
  private readonly rollbackFn: (rn: RailNode) => void;

  constructor(prevTail: RailNode, rollbackFn: (prevTail: RailNode) => void) {
    this.prevTail = prevTail;
    this.rollbackFn = rollbackFn;
  }

  act(p: Platform) {
    return p.on;
  }

  rollback() {
    this.rollbackFn(this.prevTail);
  }
}

class ActionProxy {
  private readonly actions: Transactional[];
  private _line: RailLine;
  private _tailNode: RailNode;
  private _tailEdge: RailEdge;

  constructor() {
    this.actions = [];
    this._line = new RailLine();
  }

  public line() {
    return this._line;
  }

  public tail() {
    return this._tailNode;
  }

  public startRail(x: number, y: number) {
    const action = new StartRailAction(
      this._tailNode,
      (prevTail) => (this._tailNode = prevTail)
    );
    this._tailNode = action.act(x, y);
    this.actions.push(action);
  }

  public extendRail(x: number, y: number) {
    const action = new ExtendRailAction(
      this._tailNode,
      (prevTail) => (this._tailNode = prevTail)
    );
    const re = action.act(x, y);
    this._tailNode = re.to;
    this._tailEdge = re;
    this.actions.push(action);
  }

  public buildStation(rn?: RailNode) {
    const action = new BuildStationAction(
      this._tailNode,
      (prevTail) => (this._tailNode = prevTail)
    );
    action.act(rn);
    if (rn) this._tailNode = rn;
    this.actions.push(action);
  }

  public startLine() {
    const action = new StartLineAction(this._line);
    action.act(this._tailNode.platform);
    this.actions.push(action);
  }

  public insertEdge() {
    const action = new InsertEdgeAction(this._line);
    action.act(this._tailEdge);
    this.actions.push(action);
  }

  public insertPlatform(p?: Platform) {
    const action = new InsertPlatformAction(this._line);
    action.act(p ?? this._tailNode.platform);
    this.actions.push(action);
  }

  public deployTrain(lt: LineTask) {
    const action = new DeployTrainAction();
    action.act(lt);
    this.actions.push(action);
  }

  public startBranch(p: Platform) {
    const action = new StartBranchAction(
      this._tailNode,
      (prevTail) => (this._tailNode = prevTail)
    );
    this._tailNode = action.act(p);
    this.actions.push(action);
  }

  public commit() {
    this.actions.length = 0;
  }

  public rollback() {
    while (this.actions.length > 0) {
      this.actions.pop().rollback();
    }
  }
}

export default ActionProxy;
