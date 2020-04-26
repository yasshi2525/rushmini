import Point from "./point";
import { Pointable } from "./pointable";

type Route = { readonly goal: RoutableObject; next: RoutableObject };

export interface Routable {
  nextFor(goal: Routable): Routable;
  setNext(next: Routable, goal: Routable): void;
}

abstract class RoutableObject implements Routable {
  private readonly table: Route[] = [];

  public nextFor(goal: RoutableObject) {
    return this.table.find((r) => r.goal === goal)?.next;
  }

  public setNext(next: RoutableObject, goal: RoutableObject) {
    const current = this.table.find((r) => r.goal === goal);
    if (current) {
      current.next = next;
    } else {
      this.table.push({ goal, next });
    }
  }
}

export default RoutableObject;
