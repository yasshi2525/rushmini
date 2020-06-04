import { createSquareSprite } from "./sprite";

const COLOR = "#888888";
const ALPHA = 0.5;

const createInstruction = (loadedScene: g.Scene) => {
  const container = new g.E({ scene: loadedScene });
  const sprite = createSquareSprite(loadedScene, "instruction_img");
  sprite.modified();
  const bg = new g.FilledRect({
    scene: loadedScene,
    width: sprite.width,
    height: sprite.height - 65,
    cssColor: COLOR,
    opacity: ALPHA,
  });
  container.append(bg);
  container.append(sprite);
  container.x = (g.game.width - sprite.width) / 2;
  container.y = -23;
  container.modified();
  return container;
};

export default createInstruction;
