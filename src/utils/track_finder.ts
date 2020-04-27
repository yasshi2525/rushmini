import listener, { EventType as Ev } from "../models/listener";
import PathFinder from "../models/path_finder";
import RailEdge from "../models/rail_edge";
import RailNode from "../models/rail_node";
import userResource from "../models/user_resource";

// 路線の自動延伸時には使う。
// 今は使っていない

const finders: PathFinder[] = [];
const rns: RailNode[] = [];
const res: RailEdge[] = [];

/**
 * 徒歩に比べて鉄道の移動がどれほど優位か
 */
const ratio = 0.1;

const handler = {
  onCreated: {
    railNode: (rn: RailNode) => {
      finders.forEach((_f) => _f.node(rn));

      // all re => rn for the goal
      const f = new PathFinder(rn);
      res.forEach((re) => f.edge(re.from, re.to, re.arrow.length() * ratio));

      finders.push(f);
      rns.push(rn);
    },
    railEdge: (re: RailEdge) => {
      finders.forEach((f) => {
        // re for each goal
        f.edge(re.from, re.to, re.arrow.length() * ratio);
      });

      res.push(re);
    },
  },
};

const trackFinder = {
  reset: () => [finders, rns, res].forEach((l) => (l.length = 0)),
  init: () => {
    listener.find(Ev.CREATED, RailNode).register(handler.onCreated.railNode);
    listener.find(Ev.CREATED, RailEdge).register(handler.onCreated.railEdge);

    userResource.stateListeners.push({
      onFixed: () => finders.forEach((f) => f.execute()),
    });
  },
};

export default trackFinder;
