import Gate from "./gate";
import modelListener, { EventType } from "./listener";
import Platform from "./platform";

class Station {
  public readonly platforms: Platform[];
  public readonly gate: Gate;

  constructor() {
    this.platforms = [];
    this.gate = new Gate(this);
    modelListener.add(EventType.CREATED, this);
  }

  public getPos(): { readonly x: number; readonly y: number } {
    const center = { x: 0, y: 0 };
    this.platforms.forEach((p) => {
      center.x += p.on.x / this.platforms.length;
      center.y += p.on.y / this.platforms.length;
    });
    return center;
  }
}

export default Station;
