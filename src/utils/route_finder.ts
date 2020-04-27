import Company from "../models/company";
import Gate from "../models/gate";
import listener, { EventType as Ev } from "../models/listener";
import PathFinder from "../models/path_finder";
import Platform from "../models/platform";
import { distance } from "../models/pointable";
import Residence from "../models/residence";
import userResource, { ModelStateType } from "../models/user_resource";

const finders: PathFinder[] = [];
const rs: Residence[] = [];
const cs: Company[] = [];
const ps: Platform[] = [];
const gs: Gate[] = [];

/**
 * P <=> P
 * @param f
 */
const transport = (f: PathFinder) => {
  if (userResource.getState() === ModelStateType.FIXED) {
    ps.forEach((dept) =>
      ps.forEach((dest) => f.edge(dept, dest, dept.costFor(dest)))
    );
  }
};

const handler = {
  onCreated: {
    residence: (r: Residence) => {
      finders.forEach((f) => {
        f.node(r);

        // R => one C for each goal
        const c = cs.find((c) => c === f.goal.origin);
        f.edge(r, c, distance(c, r));

        // R => all G for each goal
        gs.forEach((g) => f.edge(r, g, distance(g, r)));

        // P <=> P
        transport(f);

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
        g.st.platforms.forEach((p) => {
          f.edge(p, g, distance(g, p));
          f.edge(g, p, distance(p, g));
        });
      });

      // P <=> P
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
        const c = cs.find((c) => c === f.goal.origin);
        f.edge(g, c, distance(g, c));

        // G <=> P for each goal
        g.st.platforms.forEach((p) => {
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
  },
};

const routeFinder = {
  reset: () => [finders, rs, cs, ps, gs].forEach((l) => (l.length = 0)),
  init: () => {
    listener.find(Ev.CREATED, Residence).register(handler.onCreated.residence);
    listener.find(Ev.CREATED, Company).register(handler.onCreated.company);
    listener.find(Ev.CREATED, Gate).register(handler.onCreated.gate);
    listener.find(Ev.CREATED, Platform).register(handler.onCreated.platform);

    userResource.stateListeners.push({
      onFixed: () => {
        // 鉄道による移動距離を計算 (前提: transport_finder が実行済み)
        finders.forEach((f) => {
          // P <=> P
          transport(f);
          f.execute();
        });
      },
    });
  },
};

export default routeFinder;
