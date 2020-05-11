import Company from "../models/company";
import DeptTask from "../models/dept_task";
import Gate from "../models/gate";
import Human from "../models/human";
import listener, { EventType as Ev } from "../models/listener";
import PathFinder from "../models/path_finder";
import Platform from "../models/platform";
import { distance } from "../models/pointable";
import Residence from "../models/residence";
import userResource, { ModelState } from "../models/user_resource";
import { find, remove } from "./common";

const finders: PathFinder[] = [];
const rs: Residence[] = [];
const cs: Company[] = [];
const ps: Platform[] = [];
const gs: Gate[] = [];
const lts: DeptTask[] = [];
const hs: Human[] = [];

/**
 * lt => P => P
 * Transportでは 駅間のコストを持っているため、これを対会社ゴールのリストにコピーする
 * @param f
 */
const transport = (f: PathFinder) => {
  lts.forEach((dept) =>
    ps.forEach((dest) => {
      if (dept.nextFor(dest))
        f.edge(dept, dest, dept.distanceFor(dest), dept.stay.paymentFor(dest));
    })
  );
};

/**
 * 改札内にいるため、改札(出場)かホームへのみ移動可能
 * @param f
 * @param h
 */
const _tryLinkGate = (f: PathFinder, h: Human) => {
  if (h._getGate()) {
    const g = h._getGate();
    f.edge(h, g, distance(g, h));
    g.station.platforms.forEach((p) => f.edge(h, p, distance(p, h)));
    return true;
  }
  return false;
};

/**
 * ホーム内にいるため、ホームか、改札へのみ移動可能
 * @param f
 * @param h
 */
const _tryLinkPlatform = (f: PathFinder, h: Human) => {
  if (h._getPlatform()) {
    const p = h._getPlatform();
    const g = p.station.gate;
    f.edge(h, p, distance(p, h));
    f.edge(h, g, distance(h, g));
    return true;
  }
  return false;
};

/**
 * 乗車列にいる場合、乗車列か改札へのみ移動可能
 * @param f
 * @param h
 */
const _tryLinkDeptTask = (f: PathFinder, h: Human) => {
  if (h._getDeptTask()) {
    const dept = h._getDeptTask();

    f.edge(h, dept, distance(dept.stay, h));
    f.edge(h, dept.stay, distance(dept.stay, h));
    return true;
  }
  return false;
};

/**
 * 車内にいる場合は、電車が経路探索結果を持っているため、それに接続する
 * @param f
 * @param h
 */
const _tryLinkTrain = (f: PathFinder, h: Human) => {
  if (h._getTrain()) {
    const t = h._getTrain();
    f.edge(h, t, distance(t, h));
    return true;
  }
  return false;
};

/**
 * 地面にいる場合、改札か会社に移動可能
 * @param f
 * @param h
 */
const _tryLinkGround = (f: PathFinder, h: Human) => {
  const c = f.goal.origin;
  gs.forEach((_g) => {
    f.edge(h, _g, distance(_g, h));
  });
  f.edge(h, c, distance(h.destination, h));
  return true;
};

/**
 * 人の現在地から目的地までの行き方を求めます
 * @param f
 */
const humanRouting = (f: PathFinder) => {
  hs.filter((h) => h.destination === f.goal.origin).forEach((h, idx) => {
    f.unnode(h, true);
    f.node(h);

    if (!_tryLinkGate(f, h))
      if (!_tryLinkPlatform(f, h))
        if (!_tryLinkDeptTask(f, h))
          if (!_tryLinkTrain(f, h)) _tryLinkGround(f, h);
  });
};

const addPtoGrelation = (f: PathFinder, g: Gate) => {
  // all [G <=> P] for the goal
  g.station.platforms.forEach((p) => {
    f.edge(p, g, distance(g, p));
    f.edge(g, p, distance(p, g));
  });
};

const handler = {
  onCreated: {
    residence: (r: Residence) => {
      finders.forEach((f) => {
        f.node(r);

        // R => one C for each goal
        const c = find(cs, (_c) => _c === f.goal.origin);
        f.edge(r, c, distance(c, r));

        // R => all G for each goal
        gs.forEach((g) => f.edge(r, g, distance(g, r)));

        f.execute();
      });
      rs.push(r);
    },

    company: (c: Company) => {
      const f = new PathFinder(c);

      rs.forEach((r) => {
        // all R => one C for the goal
        f.edge(r, c, distance(c, r));

        // all R => all G for the goal
        gs.forEach((g) => f.edge(r, g, distance(g, r)));
      });

      gs.forEach((g) => {
        // all G => one C for the goal
        f.edge(g, c, distance(c, g));

        // all [G <=> P] for the goal
        addPtoGrelation(f, g);
      });

      lts.forEach((lt) => {
        // all P => one lt for the goal
        f.edge(lt.stay, lt, 0);
      });

      // lt => P
      transport(f);

      f.execute();
      finders.push(f);
      cs.push(c);
    },

    gate: (g: Gate) => {
      finders.forEach((f) => {
        f.node(g);

        // all R => G for each goal
        rs.forEach((r) => f.edge(r, g, distance(g, r)));

        // G => one C for each goal
        const c = find(cs, (_c) => _c === f.goal.origin);
        f.edge(g, c, distance(g, c));

        // G <=> P for each goal
        addPtoGrelation(f, g);
      });

      gs.push(g);
    },

    platform: (p: Platform) => {
      finders.forEach((f) => {
        f.node(p);

        // G <=> P for each goal
        const g = p.station.gate;
        f.edge(p, g, distance(g, p));
        f.edge(g, p, distance(p, g));
      });

      ps.push(p);
    },

    lineTask: (lt: DeptTask) => {
      finders.forEach((f) => {
        f.node(lt);

        // P => lt for each goal
        const p = lt.stay;
        f.edge(p, lt, 0);
      });

      lts.push(lt);
    },

    human: (h: Human) => {
      hs.push(h);
    },
  },
  onDeleted: {
    gate: (g: Gate) => {
      finders.forEach((f) => {
        rs.forEach((r) => f.unedge(r, g));
        f.unedge(
          g,
          find(cs, (c) => f.goal.origin === c)
        );
        g.station.platforms.forEach((p) => {
          f.unedge(p, g);
          f.unedge(g, p);
        });
        f.unnode(g);
      });
      remove(gs, g);
    },
    platform: (p: Platform) => {
      finders.forEach((f) => {
        f.unedge(p, p.station.gate);
        f.unedge(p.station.gate, p);
        f.unnode(p);
      });
      remove(ps, p);
    },
    lineTask: (lt: DeptTask) => {
      finders.forEach((f) => {
        f.unedge(lt.stay, lt);
        f.unnode(lt);
      });
      remove(lts, lt);
    },
    human: (h: Human) => {
      remove(hs, h);
    },
  },
};

const routeFinder = {
  reset: () => [finders, rs, cs, ps, gs, lts].forEach((l) => (l.length = 0)),
  init: () => {
    listener.find(Ev.CREATED, Residence).register(handler.onCreated.residence);
    listener.find(Ev.CREATED, Company).register(handler.onCreated.company);
    listener.find(Ev.CREATED, Gate).register(handler.onCreated.gate);
    listener.find(Ev.CREATED, Platform).register(handler.onCreated.platform);
    listener.find(Ev.CREATED, DeptTask).register(handler.onCreated.lineTask);
    listener.find(Ev.CREATED, Human).register(handler.onCreated.human);
    listener.find(Ev.DELETED, Gate).register(handler.onDeleted.gate);
    listener.find(Ev.DELETED, Platform).register(handler.onDeleted.platform);
    listener.find(Ev.DELETED, DeptTask).register(handler.onDeleted.lineTask);
    listener.find(Ev.DELETED, Human).register(handler.onDeleted.human);

    userResource.stateListeners.push({
      onFixed: () => {
        // 鉄道による移動距離を計算 (前提: transport_finder が実行済み)
        finders.forEach((f) => {
          // Lt => P
          transport(f);
          humanRouting(f);
          f.execute();
          hs.forEach((h) => h._reroute());
        });
      },
    });
  },
};

export default routeFinder;
