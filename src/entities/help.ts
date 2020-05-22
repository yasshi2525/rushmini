import { createFramedRect, createWorkingArea } from "./rectangle";
import { createSquareSprite } from "./sprite";

const MARGIN_RATE = 0.1;
const SIZE = 0.8;
const COLOR = "#444444";
const ALPHA = 0.75;

const createHelp = (loadedScene: g.Scene) => {
  const container = new g.E({ scene: loadedScene });

  const sprite = createSquareSprite(loadedScene, "help_basic");
  sprite.x = g.game.width * (1 - MARGIN_RATE) - sprite.width;
  sprite.y = g.game.height * MARGIN_RATE;
  sprite.touchable = true;
  sprite.modified();
  container.append(sprite);

  const mask = createFramedRect(
    loadedScene,
    g.game.width * SIZE,
    g.game.height * SIZE,
    COLOR,
    0
  );
  mask.x = (g.game.width * (1 - SIZE)) / 2;
  mask.y = (g.game.height * (1 - SIZE)) / 2;
  mask.touchable = true;
  mask.opacity = ALPHA;
  mask.modified();
  mask.hide();
  container.append(mask);

  const image = createSquareSprite(loadedScene, "instruction_img");
  image.anchor(0, 0);
  image.scale(0.75);
  image.x = mask.x + (mask.width - image.width) / 2;
  image.y = mask.y + (mask.height - image.height) / 2;
  image.modified();
  mask.append(image);

  const close = createSquareSprite(loadedScene, "close_basic");
  close.x = mask.width - close.width;
  close.y = 0;
  close.modified();
  mask.append(close);

  sprite.pointUp.add(() => {
    mask.show();
  });

  mask.pointUp.add(() => {
    mask.hide();
  });
  return container;
};

export default createHelp;
