import Point from "./point";
import { Pointable } from "./pointable";

type Route = {
  readonly goal: RoutableObject;
  next: RoutableObject;
  cost: number;
};

export interface Routable {
  nextFor(goal: Routable): Routable;
  costFor(goal: Routable): number;
  _setNext(next: Routable, goal: Routable, cost: number): void;
}

abstract class RoutableObject implements Routable {
  private readonly table: Route[] = [];

  public nextFor(goal: RoutableObject) {
    return this.table.find((r) => r.goal === goal)?.next;
  }

  public costFor(goal: RoutableObject) {
    return this.table.find((r) => r.goal === goal)?.cost ?? NaN;
  }

  public _setNext(next: RoutableObject, goal: RoutableObject, cost: number) {
    const current = this.table.find((r) => r.goal === goal);
    if (current) {
      current.next = next;
      current.cost = cost;
    } else {
      this.table.push({ goal, next, cost });
    }
  }
}

export default RoutableObject;
