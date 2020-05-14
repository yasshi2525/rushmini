import { createSquareSprite } from "./sprite";

const createFrame = (loadedScene: g.Scene) => {
  const sprite = createSquareSprite(loadedScene, "frame_main");
  sprite.x = (g.game.width - sprite.width) / 2;
  sprite.y = (g.game.height - sprite.height) / 2;
  sprite.modified();
  return sprite;
};

export default createFrame;
