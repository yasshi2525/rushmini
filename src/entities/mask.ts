import { createFramedRect } from "./rectangle";

const SIZE = 0.8;
const COLOR = "#888888";
const ALPHA = 0.5;

const createMask = (loadedScene: g.Scene) => {
  const mask = createFramedRect(
    loadedScene,
    g.game.width * SIZE,
    g.game.height * SIZE,
    COLOR,
    0
  );
  mask.x = (g.game.width * (1 - SIZE)) / 2;
  mask.y = (g.game.height * (1 - SIZE)) / 2;
  mask.opacity = ALPHA;
  mask.modified();
  mask.hide();
  return mask;
};

export default createMask;
