import Human from "./human";

type Route = {
  readonly goal: RoutableObject;
  next: RoutableObject;
  cost: number;
};

export interface Routable {
  /**
   * 指定された目的地に移動するには、次にどの地点に向かう必要があるか返します
   * @param goal
   */
  nextFor(goal: Routable): Routable;
  /**
   * 指定された地点までの移動コストを返します
   * @param goal
   */
  costFor(goal: Routable): number;
  /**
   * 指定された目的地に向かうには、どれほどのコストがかかり、次にどこに向かう必要があるか返します
   * @param next
   * @param goal
   * @param cost
   */
  _setNext(next: Routable, goal: Routable, cost: number): void;

  /**
   * 自身を目的地とする移動者に対し、指定されたframe分、アクションさせます
   * @param subject
   * @param onComplete
   */
  _fire(subject: Human, onComplete: () => void): void;
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

  abstract _fire(subject: Human, onComplete: () => void): void;
}

export default RoutableObject;
