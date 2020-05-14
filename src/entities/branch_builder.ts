import Station from "../models/station";
import userResource from "../models/user_resource";
import { find } from "../utils/common";
import viewer, { ViewerEvent } from "../utils/viewer";
import connect from "./connector";
import { adjust } from "./creator";
import ViewObjectFactory from "./factory";
import { createSquareSprite } from "./sprite";

const SIZE = 0.8;

const createEmphasis = (scene: g.Scene, subject: Station, name: string) => {
  const sprite = createSquareSprite(scene, name);
  const panel = adjust(scene, subject, sprite);
  return panel;
};

const handleStart = (
  container: g.E,
  x: number,
  y: number,
  factory: ViewObjectFactory<Station>
) => {
  const panel = container.parent as g.Pane;
  const obj = panel.findPointSourceByPoint(
    { x: x + panel.x, y: y + panel.y },
    undefined,
    true
  );
  const found = find(
    factory.children,
    (vo) => vo.viewer.children[0] === obj?.target
  );
  if (found) {
    container.hide();
    panel.append(createEmphasis(panel.scene, found.subject, "station_covered"));
    userResource.branch(found.subject.platforms[0]);
    viewer.fire(ViewerEvent.BRANCHING);
  }
  return found !== undefined;
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
  const container = new g.E({ scene: loadedScene });
  panel.append(container);
  const factory = new ViewObjectFactory<Station>(container, (sc, s) =>
    createEmphasis(sc, s, "station_candidate")
  );
  connect(factory, Station);
  panel.pointDown.add((ev) => {
    started = handleStart(container, ev.point.x, ev.point.y, factory);
  });
  panel.pointMove.add((ev) => {
    if (started) {
      userResource.extend(
        ev.point.x + ev.startDelta.x,
        ev.point.y + ev.startDelta.y
      );
    }
  });
  panel.pointUp.add(() => {
    if (started) {
      userResource.end();
      viewer.fire(ViewerEvent.BRANCHED);
    }
  });
  const sprite = createSquareSprite(loadedScene, "branch_txt");
  sprite.x = (panel.width - sprite.width) / 2;
  sprite.y = 40;
  sprite.modified();
  panel.append(sprite);
  panel.hide();
  return panel;
};

export default createBranchBuilder;
