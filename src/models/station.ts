import Gate from "./gate";
import modelListener, { EventType } from "./listener";
import Platform from "./platform";
import Point from "./point";
import { Pointable } from "./pointable";

class Station implements Pointable {
  public readonly platforms: Platform[];
  public readonly gate: Gate;

  constructor() {
    this.platforms = [];
    this.gate = new Gate(this);
    modelListener.add(EventType.CREATED, this);
  }

  public loc() {
    const p = this.platforms.reduce(
      (prev, current, _, src) => {
        prev.x += current.on.loc().x / src.length;
        prev.y += current.on.loc().y / src.length;
        return prev;
      },
      { x: 0, y: 0 }
    );
    return new Point(p.x, p.y);
  }

  public _remove() {
    modelListener.add(EventType.DELETED, this);
  }
}

export default Station;
