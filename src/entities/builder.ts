import userResource from "../models/user_resource";
import routeFinder from "../utils/route_finder";
import viewer, { ViewerEvent } from "../utils/viewer";
import { appnedWarning, createWorkingArea } from "./rectangle";
import { createSquareSprite } from "./sprite";

const WARNING_Y = 160;

/**
 * カーソルの動きに沿って路線を作成します
 * @param loadedScene
 */
const createBuilder = (loadedScene: g.Scene) => {
  const builder = createWorkingArea(loadedScene, { touchable: true });

  const warning = appnedWarning(builder);
  userResource.stateListeners.push({
    onRollback: () => warning.show(),
  });

  let pointerId: number = undefined;

  // カーソルが押下されたならば、路線建設を開始する
  builder.pointDown.add((ev) => {
    if (pointerId === undefined) {
      pointerId = ev.pointerId;
      warning.hide();
      userResource.start(ev.point.x, ev.point.y);
    }
  });

  // カーソルの地点まで線路を延伸する
  builder.pointMove.add((ev) => {
    if (ev.pointerId === pointerId) {
      userResource.extend(
        ev.point.x + ev.startDelta.x,
        ev.point.y + ev.startDelta.y
      );
    }
  });

  // カーソルの地点を終点とする
  builder.pointUp.add((ev) => {
    if (ev.pointerId === pointerId) {
      userResource.end();
      if (routeFinder.isBroken()) {
        userResource.rollback();
      } else if (userResource.shouldRollaback()) {
        userResource.rollback();
      } else {
        userResource.commit();
        viewer.fire(ViewerEvent.BUILT);
      }
      pointerId = undefined;
    }
  });

  return builder;
};

export default createBuilder;
