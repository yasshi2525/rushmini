import { createSquareSprite } from "./sprite";

const SIZE = 0.8;
const INSTRUCTION_Y = 120;

const createPanel = (loadedScene: g.Scene) =>
  new g.E({
    scene: loadedScene,
    x: (g.game.width * (1 - SIZE)) / 2,
    y: (g.game.height * (1 - SIZE)) / 2,
    width: g.game.width * SIZE,
    height: g.game.height * SIZE,
  });

const createWaitPanel = (loadedScene: g.Scene) => {
  const panel = createPanel(loadedScene);
  const sprite = createSquareSprite(loadedScene, "available_txt");
  sprite.x = (panel.width - sprite.width) / 2;
  sprite.y = INSTRUCTION_Y;
  panel.append(sprite);
  panel.hide();
  return panel;
};

export default createWaitPanel;
