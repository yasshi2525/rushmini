import modelListener, { EventType } from "./listener";
import RailNode from "./rail_node";
import Station from "./station";

class Platform {
  public readonly on: RailNode;
  public readonly station: Station;

  constructor(on: RailNode, st: Station) {
    this.on = on;
    this.station = st;
    on.platform = this;
    st.platforms.push(this);
    modelListener.add(EventType.CREATED, this);
  }
}

export default Platform;
