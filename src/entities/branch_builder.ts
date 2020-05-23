import Station from "../models/station";
import userResource from "../models/user_resource";
import { find } from "../utils/common";
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

const createEmphasis = (scene: g.Scene, subject: Station, name: string) => {
  const sprite = createSquareSprite(scene, name);
  const panel = adjust(scene, subject, sprite);
  return panel;
};

const createBranchBuilder = (loadedScene: g.Scene) => {
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

      const obj = panel.findPointSourceByPoint(
        { x: ev.point.x + panel.x, y: ev.point.y + panel.y },
        undefined,
        true
      );
      const found = find(
        factory.children,
        (vo) => vo.viewer.children[0] === obj?.target
      );
      if (found) {
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
