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
import { find } from "./common";

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
  if (userResource.getState() === ModelState.FIXED) {
    lts.forEach((dept) =>
      ps.forEach((dest) => {
        if (dept.nextFor(dest))
          f.edge(
            dept,
            dest,
            dept.distanceFor(dest),
            dept.stay.paymentFor(dest)
          );
      })
    );
  }
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
        g.station.platforms.forEach((p) => {
          f.edge(p, g, distance(g, p));
          f.edge(g, p, distance(p, g));
        });
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
        g.station.platforms.forEach((p) => {
          f.edge(p, g, distance(g, p));
          f.edge(g, p, distance(p, g));
        });
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

    userResource.stateListeners.push({
      onFixed: () => {
        // 鉄道による移動距離を計算 (前提: transport_finder が実行済み)
        finders.forEach((f) => {
          // Lt => P
          transport(f);
          f.execute();
        });
      },
    });
  },
};

export default routeFinder;
