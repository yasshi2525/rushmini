import PathFinder from "../models/path_finder";
import RailLine from "../models/rail_line";
import userResource from "../models/user_resource";
import Company from "../models/company";
import listener, { EventType as Ev } from "../models/listener";
import Platform from "../models/platform";
import EdgeTask from "../models/edge_task";
import DeptTask from "../models/dept_task";
import RailNode from "../models/rail_node";
import { distance } from "../models/pointable";
import LineTask from "../models/line_task";

/**
 * 徒歩に比べて鉄道の移動がどれほど優位か
 */
const RATIO = 0.1;

const finders: PathFinder[] = [];
const ls: RailLine[] = [];
const ps: Platform[] = [];

/**
 * 前の駅から次の駅までの距離をタスク距離合計とする
 */
const scanRailLine = (f: PathFinder, l: RailLine) => {
  let prevDept = l.top;
  let length = 0;
  let current = prevDept.next;

  while (current !== l.top) {
    if (current.isDeptTask()) {
      f.edge(
        prevDept.departure().platform,
        current.departure().platform,
        length
      );
      prevDept = current;
      length = 0;
    } else {
      length += current.length() * RATIO;
    }
    current = current.next;
  }
  f.edge(prevDept.departure().platform, current.departure().platform, length);
};

const handler = {
  onCreated: {
    platform: (p: Platform) => {
      finders.forEach((f) => f.node(p));
      const f = new PathFinder(p);
      finders.push(f);
      ps.push(p);
    },
    railLine: (l: RailLine) => ls.push(l),
  },
  onFixed: () => {
    finders.forEach((f) => {
      ls.forEach((l) => scanRailLine(f, l));
      f.execute();
    });
  },
};

const transportFinder = {
  reset: () => [finders, ls, ps].forEach((l) => (l.length = 0)),
  init: () => {
    listener.find(Ev.CREATED, Platform).register(handler.onCreated.platform);
    listener.find(Ev.CREATED, RailLine).register(handler.onCreated.railLine);
    userResource.stateListeners.push({
      onFixed: handler.onFixed,
    });
  },
};

export default transportFinder;
