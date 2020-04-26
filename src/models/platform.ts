import modelListener, { EventType } from "./listener";
import RailNode from "./rail_node";
import RoutableObject from "./routable";
import Station from "./station";

class Platform extends RoutableObject {
  public readonly on: RailNode;
  public readonly station: Station;

  constructor(on: RailNode, st: Station) {
    super();
    this.on = on;
    this.station = st;
    on.platform = this;
    st.platforms.push(this);
    modelListener.add(EventType.CREATED, this);
  }

  public loc() {
    return this.on.loc();
  }
}

export default Platform;
