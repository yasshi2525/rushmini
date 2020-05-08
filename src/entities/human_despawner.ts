import Human, { HumanState } from "../models/human";
import modelListener, { EventType } from "../models/listener";
import { insertTop } from "../utils/common";
import ticker from "../utils/ticker";
import { adjust } from "./creator";
import { createSquareSprite } from "./sprite";

const SIZE = 0.8;
const ANIMATION_SEC = 1;
const ACCELERATION = 0.1;

const handleDeleted = (container: g.E, h: Human) => {
  const scene = container.scene;
  const sprite = createSquareSprite(scene, "human_basic");
  const panel = adjust(scene, h, sprite);

  let velocity = 0;
  const update = () => {
    // 会社に到達した場合は死亡エフェクトを出さない
    if (h.state() === HumanState.DIED) {
      panel.y -= velocity;
    }
    panel.opacity -= 1 / (ANIMATION_SEC * ticker.fps());
    panel.opacity = Math.max(panel.opacity, 0);
    panel.modified();

    if (panel.opacity === 0) {
      container.remove(panel);
      scene.update.remove(update);
    }

    velocity += ACCELERATION;
  };
  insertTop(panel, container);
  scene.update.add(update);
};

const createHumanDespawner = (loadedScene: g.Scene) => {
  const panel = new g.Pane({
    scene: loadedScene,
    x: (g.game.width * (1 - SIZE)) / 2,
    y: (g.game.height * (1 - SIZE)) / 2,
    width: g.game.width * SIZE,
    height: g.game.height * SIZE,
  });
  modelListener
    .find(EventType.DELETED, Human)
    .register((h) => handleDeleted(panel, h));
  return panel;
};

export default createHumanDespawner;
