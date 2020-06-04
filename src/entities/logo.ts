import { createSquareSprite } from "./sprite";

/**
 * タイトルに表示する説明文
 * 6秒経過かガイドパネルが押下されたならば、ゲームを開始する
 * @param loadedScene
 */
const createLogo = (loadedScene: g.Scene) => {
  const panel = new g.E({
    scene: loadedScene,
    width: g.game.width,
    height: g.game.height,
  });
  const title = createSquareSprite(loadedScene, "title_txt");
  title.x = (panel.width - title.width) / 2;
  title.y = panel.height * 0.1;
  title.modified();
  panel.append(title);

  const img = createSquareSprite(loadedScene, "title_img");
  img.x = (panel.width - img.width) / 2;
  img.y = panel.height * 0.32;
  img.modified();
  panel.append(img);

  return panel;
};

export default createLogo;
