import modelListener, { EventType } from "./listener";
import RoutableObject from "./routable";
import Station from "./station";

class Gate extends RoutableObject {
  public readonly st: Station;
  public capacity: number = 1;

  constructor(st: Station) {
    super();
    this.st = st;
    modelListener.add(EventType.CREATED, this);
  }

  public loc() {
    return this.st.loc();
  }
}

export default Gate;
