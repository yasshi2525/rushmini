import { ScoreEvent } from "../utils/scorer";
import ticker from "../utils/ticker";
import connect from "./connector";
import { adjust } from "./creator";
import ViewObjectFactory from "./factory";
import createFont from "./font";
import { createWorkingArea } from "./rectangle";

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
  const panel = createWorkingArea(loadedScene, { isPane: true });

  const factory = new ViewObjectFactory<ScoreEvent>(panel, createScorePanel);
  connect(factory, ScoreEvent);
  return panel;
};

export default createScoreViewer;
