import scenes, { SceneType } from "../utils/scene";
import ticker from "../utils/ticker";
import { createSquareSprite } from "./sprite";

const WAIT_SEC = 6;
const titleFontSize = 50;
const titleOffsetY = 50;

/**
 * タイトルに表示する説明文
 * 6秒経過かガイドパネルが押下されたならば、ゲームを開始する
 * @param loadedScene
 */
const createInstraction = (loadedScene: g.Scene) => {
  const panel = new g.E({
    scene: loadedScene,
    width: g.game.width,
    height: g.game.height,
    touchable: true,
  });
  const title = createSquareSprite(loadedScene, "title_txt");
  title.x = (panel.width - title.width) / 2;
  title.y = panel.height * 0.1;
  title.modified();
  panel.append(title);

  const img = createSquareSprite(loadedScene, "title_img");
  img.x = (panel.width - img.width) / 2;
  img.y = panel.height * 0.4;
  img.modified();
  panel.append(img);

  let cnt = 0;
  const counter = () => {
    if (cnt > ticker.fps() * WAIT_SEC) {
      loadedScene.update.remove(counter);
      scenes.replace(SceneType.GAME);
    }
    cnt++;
  };
  loadedScene.update.add(counter);
  panel.pointUp.addOnce(() => {
    scenes.replace(SceneType.GAME);
  });

  return panel;
};

export default createInstraction;
