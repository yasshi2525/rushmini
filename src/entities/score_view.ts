import { ScoreEvent } from "../utils/scorer";
import ticker from "../utils/ticker";
import connect from "./connector";
import { adjust } from "./creator";
import ViewObjectFactory from "./factory";
import createFont from "./font";

const SIZE = 0.8;
const SPEED = 30;

const createScorePanel = (scene: g.Scene, ev: ScoreEvent) => {
  const font =
    ev.value >= 0 ? createFont("score_positive") : createFont("score_negative");
  const text =
    ev.value >= 0 ? `+${Math.floor(ev.value)}` : `${Math.floor(ev.value)}`;

  const sprite = new g.Label({
    y: -21,
    scene,
    font,
    fontSize: 21,
    text,
  });

  let counter = 0;
  const mv = () => {
    if (counter > ticker.fps()) {
      sprite.update.remove(mv);
      sprite.destroy();
      return;
    } else {
      sprite.y -= SPEED / ticker.fps();
    }
    sprite.modified();
    counter++;
  };
  sprite.update.add(mv);
  return adjust(scene, ev, sprite);
};

const createScoreViewer = (loadedScene: g.Scene) => {
  const panel = new g.Pane({
    scene: loadedScene,
    x: (g.game.width * (1 - SIZE)) / 2,
    y: (g.game.height * (1 - SIZE)) / 2,
    width: g.game.width * SIZE,
    height: g.game.height * SIZE,
  });

  const factory = new ViewObjectFactory<ScoreEvent>(panel, createScorePanel);
  connect(factory, ScoreEvent);
  return panel;
};

export default createScoreViewer;
