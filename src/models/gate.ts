import modelListener, { EventType } from "./listener";
import Station from "./station";

class Gate {
  public readonly st: Station;
  public capacity: number = 1;

  constructor(st: Station) {
    this.st = st;
    modelListener.add(EventType.CREATED, this);
  }
}

export default Gate;
