import Station from "../models/station";
import userResource from "../models/user_resource";
import { find } from "../utils/common";
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
  factory: ViewObjectFactory<Station>,
  onStarted: () => void
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
    onStarted();
  }
  return found !== undefined;
};

const createBranchBuilder = (
  loadedScene: g.Scene,
  onStarted: () => void,
  onCompleted: () => void
) => {
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
    started = handleStart(
      container,
      ev.point.x,
      ev.point.y,
      factory,
      onStarted
    );
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
      panel.hide();
      onCompleted();
    }
  });
  panel.append(
    new g.SystemLabel({
      scene: loadedScene,
      text: "分岐させたい駅からドラッグ＆ドロップorスワイプして延伸しよう",
      fontSize: 20,
      x: panel.width / 2,
      y: 20 * 2,
      textAlign: g.TextAlign.Center,
    })
  );
  panel.hide();
  return panel;
};

export default createBranchBuilder;
