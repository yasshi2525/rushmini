import Station from "../models/station";
import userResource from "../models/user_resource";
import { find } from "../utils/common";
import viewer, { ViewerEvent } from "../utils/viewer";
import connect from "./connector";
import { adjust } from "./creator";
import ViewObjectFactory from "./factory";
import { createSquareSprite } from "./sprite";

const SIZE = 0.8;
const INSTRUCTION_Y = 120;
const WARNING_Y = 160;

const createEmphasis = (scene: g.Scene, subject: Station, name: string) => {
  const sprite = createSquareSprite(scene, name);
  const panel = adjust(scene, subject, sprite);
  return panel;
};

const createBranchBuilder = (loadedScene: g.Scene) => {
  let started = false;
  const panel = new g.Pane({
    scene: loadedScene,
    x: (g.game.width * (1 - SIZE)) / 2,
    y: (g.game.height * (1 - SIZE)) / 2,
    width: g.game.width * SIZE,
    height: g.game.height * SIZE,
    touchable: true,
  });

  const warning = createSquareSprite(loadedScene, "rollback_txt");
  warning.x = (panel.width - warning.width) / 2;
  warning.y = WARNING_Y;
  warning.hide();
  warning.modified();
  panel.append(warning);

  const container = new g.E({ scene: loadedScene });
  panel.append(container);
  const factory = new ViewObjectFactory<Station>(container, (sc, s) =>
    createEmphasis(sc, s, "station_candidate")
  );
  connect(factory, Station);

  let pointerId: number = undefined;
  let pivot: g.E = undefined;

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
        if (userResource.shouldRollaback()) {
          warning.show();
          userResource.rollback();
          started = false;
          container.show();
          pivot.destroy();
          viewer.fire(ViewerEvent.BRANCH_ROLLBACKED);
        } else {
          userResource.commit();
          viewer.fire(ViewerEvent.BRANCHED);
        }
      }
    }
  });
  const sprite = createSquareSprite(loadedScene, "branch_txt");
  sprite.x = (panel.width - sprite.width) / 2;
  sprite.y = INSTRUCTION_Y;
  sprite.modified();
  panel.append(sprite);
  panel.hide();
  return panel;
};

export default createBranchBuilder;
