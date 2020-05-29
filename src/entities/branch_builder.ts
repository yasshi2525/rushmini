import modelListener, { EventType } from "../models/listener";
import Point, { distance } from "../models/point";
import Station from "../models/station";
import userResource from "../models/user_resource";
import { find, remove } from "../utils/common";
import routeFinder from "../utils/route_finder";
import viewer, { ViewerEvent } from "../utils/viewer";
import connect from "./connector";
import { adjust } from "./creator";
import ViewObjectFactory from "./factory";
import {
  appendInstruction,
  appnedWarning,
  createWorkingArea,
} from "./rectangle";
import { createSquareSprite } from "./sprite";

const DIST = 62;

const createEmphasis = (scene: g.Scene, subject: Station, name: string) => {
  const sprite = createSquareSprite(scene, name);
  const panel = adjust(scene, subject, sprite);
  return panel;
};

const createBranchBuilder = (loadedScene: g.Scene) => {
  const sts: Station[] = [];
  modelListener.find(EventType.CREATED, Station).register((st) => sts.push(st));
  modelListener
    .find(EventType.DELETED, Station)
    .register((st) => remove(sts, st));

  let started = false;
  const panel = createWorkingArea(loadedScene, {
    touchable: true,
    isPane: true,
  });

  const warning = appnedWarning(panel);

  const container = new g.E({ scene: loadedScene });
  panel.append(container);
  const factory = new ViewObjectFactory<Station>(container, (sc, s) =>
    createEmphasis(sc, s, "station_candidate")
  );
  connect(factory, Station);

  let pointerId: number = undefined;
  let pivot: g.E = undefined;

  userResource.stateListeners.push({
    onRollback: () => {
      if (panel.visible()) {
        warning.show();
        started = false;
        container.show();
        pivot.destroy();
        viewer.fire(ViewerEvent.BRANCH_ROLLBACKED);
      }
    },
  });

  panel.pointDown.add((ev) => {
    if (pointerId === undefined) {
      pointerId = ev.pointerId;
      warning.hide();

      const pos = new Point(ev.point.x, ev.point.y);
      sts.sort((a, b) => distance(a.loc(), pos) - distance(b.loc(), pos));
      if (distance(sts[0].loc(), pos) < DIST) {
        const found = find(factory.children, (vo) => vo.subject === sts[0]);
        container.hide();
        pivot = createEmphasis(panel.scene, found.subject, "station_covered");
        panel.append(pivot);
        userResource.branch(found.subject.platforms[0]);
        viewer.fire(ViewerEvent.BRANCHING);
        started = true;
      }
    }
  });
  panel.pointMove.add((ev) => {
    if (pointerId === ev.pointerId && started) {
      userResource.extend(
        ev.point.x + ev.startDelta.x,
        ev.point.y + ev.startDelta.y
      );
    }
  });
  panel.pointUp.add((ev) => {
    if (pointerId === ev.pointerId) {
      pointerId = undefined;
      if (started) {
        userResource.end();
        if (routeFinder.isBroken()) {
          userResource.rollback();
        } else if (userResource.shouldRollaback()) {
          userResource.rollback();
        } else {
          userResource.commit();
          viewer.fire(ViewerEvent.BRANCHED);
        }
      }
    }
  });
  appendInstruction(panel, "branch_txt");
  panel.hide();
  return panel;
};

export default createBranchBuilder;
