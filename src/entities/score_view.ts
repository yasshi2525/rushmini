import modelListener, { EventType } from "../models/listener";
import { ScoreEvent } from "../utils/scorer";
import ticker from "../utils/ticker";
import connect from "./connector";
import { adjust } from "./creator";
import ViewObjectFactory from "./factory";
import createFont from "./font";
import { createWorkingArea } from "./rectangle";

const SPEED = 30;

export class ScoreViewEvent {
  public readonly value: number;
  public readonly panel: g.E;
  public readonly sprite: g.E;
  constructor(panel: g.E, sprite: g.E, value: number) {
    this.panel = panel;
    this.sprite = sprite;
    this.value = value;
  }
}

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

  const result = adjust(scene, ev, sprite);
  const event = new ScoreViewEvent(result, sprite, ev.value);
  modelListener.add(EventType.CREATED, event);

  let counter = 0;
  const mv = () => {
    if (counter > ticker.fps()) {
      sprite.update.remove(mv);
      modelListener.add(EventType.DELETED, event);
      sprite.destroy();
      return;
    } else {
      sprite.y -= SPEED / ticker.fps();
    }
    sprite.modified();
    counter++;
  };
  sprite.update.add(mv);

  return result;
};

const createScoreViewer = (loadedScene: g.Scene) => {
  const panel = createWorkingArea(loadedScene, { isPane: true });

  const factory = new ViewObjectFactory<ScoreEvent>(panel, createScorePanel);
  connect(factory, ScoreEvent);
  return panel;
};

export default createScoreViewer;
