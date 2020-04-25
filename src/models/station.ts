import Gate from "./gate";
import modelListener, { EventType } from "./listener";
import Platform from "./platform";
import Vector from "./vector";

class Station {
  public readonly platforms: Platform[];
  public readonly gate: Gate;

  constructor() {
    this.platforms = [];
    this.gate = new Gate(this);
    modelListener.add(EventType.CREATED, this);
  }

  public getPos() {
    let x = 0;
    let y = 0;
    this.platforms.forEach((p) => {
      x += p.on.x / this.platforms.length;
      y += p.on.y / this.platforms.length;
    });
    return new Vector(x, y);
  }
}

export default Station;
