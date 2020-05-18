import userResource from "../models/user_resource";
import viewer, { ViewerEvent } from "../utils/viewer";
import { createSquareSprite } from "./sprite";

const SIZE = 0.8;
const WARNING_Y = 160;

/**
 * カーソルの動きに沿って路線を作成します
 * @param loadedScene
 */
const createBuilder = (loadedScene: g.Scene) => {
  const builder = new g.E({
    scene: loadedScene,
    x: (g.game.width * (1 - SIZE)) / 2,
    y: (g.game.height * (1 - SIZE)) / 2,
    width: g.game.width * SIZE,
    height: g.game.height * SIZE,
    touchable: true,
  });

  const warning = createSquareSprite(loadedScene, "rollback_txt");
  warning.x = (builder.width - warning.width) / 2;
  warning.y = WARNING_Y;
  warning.hide();
  warning.modified();
  builder.append(warning);

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
      if (userResource.shouldRollaback()) {
        userResource.rollback();
        warning.show();
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
