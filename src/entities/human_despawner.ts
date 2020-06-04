import Human, { HumanState } from "../models/human";
import modelListener, { EventType } from "../models/listener";
import Point from "../models/point";
import { insertTop } from "../utils/common";
import ticker from "../utils/ticker";
import { adjust } from "./creator";
import { createWorkingArea } from "./rectangle";
import { createSquareSprite } from "./sprite";

const ANIMATION_SEC = 1;
const ACCELERATION = 0.1;

export class DespawnEvent {
  public readonly panel: g.E;
  public readonly sprite: g.E;
  public readonly isArchived: boolean;
  constructor(panel: g.E, sprite: g.E, isArchived: boolean) {
    this.panel = panel;
    this.sprite = sprite;
    this.isArchived = isArchived;
  }
}

const handleDeleted = (container: g.E, h: Human) => {
  const scene = container.scene;
  const sprite = createSquareSprite(scene, "human_basic");
  const panel = adjust(scene, h, sprite);
  const ev = new DespawnEvent(panel, sprite, h.state() === HumanState.ARCHIVED);
  modelListener.add(EventType.CREATED, ev);

  let velocity = 0;
  const initPanelLoc = new Point(panel.x, panel.y);
  const initSubjectLoc = h.loc();
  let dx = 0;
  let dy = 0;
  let effectY = 0;
  const update = () => {
    // 会社に到達した場合は死亡エフェクトを出さない
    if (h.state() === HumanState.DIED) {
      if (h._getTrain()) {
        const pos = h._getTrain().loc();
        dx = pos.x - initSubjectLoc.x;
        dy = pos.y - initSubjectLoc.y;
      }
      effectY -= velocity;
      panel.x = initPanelLoc.x + dx;
      panel.y = initPanelLoc.y + dy + effectY;
    }
    panel.opacity -= 1 / (ANIMATION_SEC * ticker.fps());
    panel.opacity = Math.max(panel.opacity, 0);
    panel.modified();

    if (panel.opacity === 0) {
      container.remove(panel);
      scene.update.remove(update);
      modelListener.add(EventType.DELETED, ev);
    }

    velocity += ACCELERATION;
  };
  insertTop(panel, container);
  scene.update.add(update);
};

const createHumanDespawner = (loadedScene: g.Scene) => {
  const panel = createWorkingArea(loadedScene, { isPane: true });
  modelListener
    .find(EventType.DELETED, Human)
    .register((h) => handleDeleted(panel, h));
  return panel;
};

export default createHumanDespawner;
