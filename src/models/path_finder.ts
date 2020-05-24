import { find, remove } from "../utils/common";
import { Routable } from "./routable";

export class PathNode {
  public readonly origin: Routable;
  /**
   * ゴールに行くまでのコスト
   */
  public cost: number = Number.MAX_VALUE;
  /**
   * ゴールに行くまでの運賃
   */
  public payment: number = 0;

  /**
   * この地点に次移動すればゴールにつく
   */
  public via: PathNode;

  public readonly _in: PathEdge[] = [];
  public readonly _out: PathEdge[] = [];

  constructor(origin: Routable) {
    this.origin = origin;
  }

  /**
   * 自身に隣接する点をコスト昇順で返します
   */
  protected sortNeighbors(): PathNode[] {
    return this._in
      .map((e) => {
        e.from.cost = e.cost;
        e.from.payment = e.payment;
        e.from.via = this;
        return e.from;
      })
      .sort((a, b) => a.cost - b.cost);
  }

  /**
   * この地点をゴールとし、連結している各地点の最短経路を求めます
   */
  public _walkThrough() {
    // 隣接点を初期到達点にする
    const queue = this.sortNeighbors();

    while (queue.length > 0) {
      const x = queue.shift();
      x._in.forEach((e) => {
        const y = e.from;
        const v = x.cost + e.cost;
        // より短い経路がみつかった
        if (v < y.cost) {
          y.cost = v;
          y.payment = x.payment + e.payment;
          y.via = x;
          queue.push(y);
          queue.sort((a, b) => a.cost - b.cost);
        }
      });
    }
  }

  public _reset() {
    this.cost = Number.MAX_VALUE;
    this.payment = 0;
    this.via = undefined;
  }
}

export class PathEdge {
  public readonly from: PathNode;
  public readonly to: PathNode;
  /**
   * from から to に行くまでのコスト
   */
  public cost: number;
  /**
   * from から to に行くまでの運賃
   */
  public payment: number;

  constructor(from: PathNode, to: PathNode, cost: number, payment: number) {
    this.from = from;
    this.to = to;
    this.cost = cost;
    this.payment = payment;
    from._out.push(this);
    to._in.push(this);
  }
}

class PathFinder {
  readonly goal: PathNode;
  protected readonly nodes: PathNode[] = [];
  protected readonly edges: PathEdge[] = [];

  constructor(goal: Routable) {
    this.goal = this.node(goal);
  }

  /**
   * 指定されたオブジェクトをノードとして登録します
   * @param node
   */
  public node(node: Routable) {
    const result = find(this.nodes, (n) => n.origin === node);
    if (!result) {
      const n = new PathNode(node);
      this.nodes.push(n);
      return n;
    }
    return result;
  }

  public unnode(node: Routable, cascade: boolean = false) {
    const result = find(this.nodes, (n) => n.origin === node);
    if (result === undefined) {
      return;
    }
    if (cascade) {
      this.edges
        .filter((e) => e.from === result)
        .forEach((e) => remove(e.to._in, e));
      this.edges
        .filter((e) => e.to === result)
        .forEach((e) => remove(e.from._out, e));
      remove(this.edges, (e) => e.from === result || e.to === result);
    }
    remove(this.nodes, result);
  }

  /**
   * 指定されたオブジェクト同士の連結を登録します。長いパスの場合登録しません
   * @param from
   * @param to
   * @param cost
   * @param payment
   */
  public edge(from: Routable, to: Routable, cost: number, payment: number = 0) {
    const result = find(
      this.edges,
      (e) => e.from.origin === from && e.to.origin === to
    );
    if (result) {
      if (result.cost >= cost) {
        result.cost = cost;
        result.payment = payment;
        return result;
      } else {
        return undefined;
      }
    } else {
      const e = new PathEdge(this.node(from), this.node(to), cost, payment);
      this.edges.push(e);
      return e;
    }
  }

  public unedge(from: Routable, to: Routable) {
    remove(this.edges, (e) => e.from.origin === from && e.to.origin === to);
  }

  public unedgeAll() {
    this.edges.forEach((e) => {
      remove(e.from._out, e);
      remove(e.to._in, e);
    });
    this.edges.length = 0;
  }

  public execute() {
    this.nodes.forEach((n) => n._reset());
    this.goal._walkThrough();
    this.nodes
      .filter((n) => n.via)
      .forEach((n) =>
        n.origin._setNext(n.via.origin, this.goal.origin, n.cost, n.payment)
      );
  }
}

export default PathFinder;
