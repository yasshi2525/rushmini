import DeptTask from "../models/dept_task";
import LineTask from "../models/line_task";
import listener, { EventType as Ev } from "../models/listener";
import PathFinder from "../models/path_finder";
import Platform from "../models/platform";
import RailLine from "../models/rail_line";
import { Routable } from "../models/routable";
import Train from "../models/train";
import userResource from "../models/user_resource";
import { remove } from "./common";

/**
 * 徒歩に比べて鉄道の移動がどれほど優位か
 */
const DIST_RATIO = 0.1;
/**
 * 1移動コストあたり、いくら料金が発生するか
 */
const PAY_RATIO = 1;

const finders: PathFinder[] = [];
const ls: RailLine[] = [];
const lts: DeptTask[] = [];
const ps: Platform[] = [];
const ts: Train[] = [];

/**
 * 電車の現在地点から各駅へのedgeを貼る。
 * これにより、電車が到達可能な駅に対して距離を設定できる
 * @param f
 * @param t
 */
const trainRouting = (f: PathFinder, t: Train) => {
  let current = t.current()._base();
  let length = current.length() * DIST_RATIO;
  do {
    if (current.isDeptTask())
      f.edge(t, current.stay, length, length * PAY_RATIO);

    current = current.next;
    length += current.length() * DIST_RATIO;
  } while (t.current()._base() !== current);
};

/**
 * 前の駅から次の駅までの距離をタスク距離合計とする
 * 乗車プラットフォーム => 発車タスク => 到着プラットフォームとする
 */
const scanRailLine = (f: PathFinder, l: RailLine) => {
  // 各発車タスクを始発とし、電車で到達可能なプラットフォームを登録する
  l.filter((lt) => lt.isDeptTask()).forEach((dept: DeptTask) => {
    // 乗車タスクとホームは相互移動可能
    f.edge(dept, dept.stay, 0, 0);
    f.edge(dept.stay, dept, 0, 0);

    let current: LineTask = dept;
    let length = current.length();

    do {
      current = current.next;
      length += current.length() * DIST_RATIO;
      if (current.isDeptTask()) {
        // Dept -> P のみ登録する
        // P -> P 接続にしてしまうと乗り換えが必要かどうか分からなくなるため
        f.edge(dept, current.stay, length, length * PAY_RATIO);
      }
    } while (dept !== current);
  });
};

const _append = (e: Routable, to: Routable[]) => {
  finders.forEach((f) => f.node(e));
  to.push(e);
};

const _remove = (e: Routable, from: Routable[]) => {
  finders.forEach((f) => f.unnode(e));
  remove(from, e);
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
    lineTask: (lt: DeptTask) => _append(lt, lts),
    train: (t: Train) => _append(t, ts),
  },
  onDeleted: {
    platform: (p: Platform) => {
      finders.forEach((_f) => _f.unnode(p));
      remove(finders, (f) => f.goal.origin === p);
      remove(ps, p);
    },
    lineTask: (lt: DeptTask) => _remove(lt, lts),
    train: (t: Train) => _remove(t, ts),
  },
  onFixed: () => {
    finders.forEach((f) => {
      f.unedgeAll();
      ts.forEach((t) => trainRouting(f, t));
      ls.forEach((l) => scanRailLine(f, l));
      f.execute();
    });
  },
};

const transportFinder = {
  reset: () => [finders, ls, ps, lts, ts].forEach((l) => (l.length = 0)),
  init: () => {
    listener.find(Ev.CREATED, Platform).register(handler.onCreated.platform);
    listener.find(Ev.CREATED, RailLine).register(handler.onCreated.railLine);
    listener.find(Ev.CREATED, DeptTask).register(handler.onCreated.lineTask);
    listener.find(Ev.CREATED, Train).register(handler.onCreated.train);
    listener.find(Ev.DELETED, Platform).register(handler.onDeleted.platform);
    listener.find(Ev.DELETED, DeptTask).register(handler.onDeleted.lineTask);
    // RailLineの削除は reset (イベント発火なし) のときのみ
    listener.find(Ev.DELETED, Train).register(handler.onDeleted.train);
    userResource.stateListeners.push({
      onFixed: handler.onFixed,
    });
  },
};

export default transportFinder;
