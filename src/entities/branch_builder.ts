import Station from "../models/station";
import connect from "./connector";
import { adjust } from "./creator";
import ViewObjectFactory from "./factory";
import { createSquareSprite } from "./sprite";

const SIZE = 0.8;

const createCandidate = (
  scene: g.Scene,
  subject: Station,
  onCompleted: () => void
) => {
  const sprite = createSquareSprite(scene, "station_candidate");
  const panel = adjust(scene, subject, sprite);
  sprite.touchable = true;
  sprite.pointUp.add(() => {
    onCompleted();
  });
  sprite.modified();
  return panel;
};

const createBranchBuilder = (loadedScene: g.Scene, onCompleted: () => void) => {
  const panel = new g.Pane({
    scene: loadedScene,
    x: (g.game.width * (1 - SIZE)) / 2,
    y: (g.game.height * (1 - SIZE)) / 2,
    width: g.game.width * SIZE,
    height: g.game.height * SIZE,
  });
  connect(
    new ViewObjectFactory<Station>(panel, (sc, sub) =>
      createCandidate(sc, sub, onCompleted)
    ),
    Station
  );
  panel.hide();
  return panel;
};

export default createBranchBuilder;
