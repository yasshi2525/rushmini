import listener, { EventType as Ev } from "../models/listener";
import PathFinder from "../models/path_finder";
import Platform from "../models/platform";
import RailLine from "../models/rail_line";
import userResource from "../models/user_resource";

/**
 * 徒歩に比べて鉄道の移動がどれほど優位か
 */
const RATIO = 0.1;

const finders: PathFinder[] = [];
const ls: RailLine[] = [];
const ps: Platform[] = [];

/**
 * 前の駅から次の駅までの距離をタスク距離合計とする
 * 乗車プラットフォーム => 発車タスク => 到着プラットフォームとする
 */
const scanRailLine = (f: PathFinder, l: RailLine) => {
  let prevDept = l.top;
  let length = 0;
  let current = prevDept.next;

  while (current !== l.top) {
    if (current.isDeptTask()) {
      // プラットフォームから乗車タスクをつなぐ
      f.edge(prevDept.departure().platform, prevDept, 0);
      // 乗車タスクを経由してプラットフォーム間を紐付ける
      f.edge(prevDept, current.departure().platform, length);
      prevDept = current;
      length = 0;
    } else {
      length += current.length() * RATIO;
    }
    current = current.next;
  }

  f.edge(prevDept.departure().platform, prevDept, 0);
  f.edge(prevDept, current.departure().platform, length);
};

const handler = {
  onCreated: {
    platform: (p: Platform) => {
      finders.forEach((_f) => _f.node(p));
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
