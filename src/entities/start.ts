import { createSquareSprite } from "./sprite";

const INTERVAL_SEC = 1.5;

const createStartButton = (loadedScene: g.Scene) => {
  const sprite = createSquareSprite(loadedScene, "start_txt");
  sprite.x = (g.game.width - sprite.width) / 2;
  sprite.y = g.game.height - sprite.height * 2;
  sprite.modified();
  let count = 0;
  const INTERVAL_FRAME = INTERVAL_SEC * g.game.fps;
  sprite.update.add(() => {
    sprite.opacity +=
      (0.7 / INTERVAL_FRAME) * 2 * (count < INTERVAL_FRAME / 2 ? -1 : +1);
    sprite.modified();
    count++;
    if (count >= INTERVAL_FRAME) {
      count -= INTERVAL_FRAME;
    }
  });
  return sprite;
};

export default createStartButton;
