import createReplay from "../entities/replay";
import { RPGAtsumaruWindow } from "../parameterObject";
import scenes, { SceneType } from "../utils/scene";

declare const window: RPGAtsumaruWindow;
const BOARD_ID = 1;

/**
 * ゲーム中に作成したスクリーンショットを表示する
 * @param prev
 */
export const handleEnding = (prev: g.E) => {
  const scene = prev.scene;
  prev.anchor(0, 0);

  scene.loaded.add(() => {
    let scale = 1;
    const anim = () => {
      if (scale < 0.66) {
        scene.update.remove(anim);
        scene.children[0].show();
        return;
      }
      prev.scale(scale);
      prev.modified();
      scale -= 0.33 / g.game.fps;
      prev.x -= (g.game.width * 0.05) / g.game.fps;
      prev.y -= (g.game.height * 0.05) / g.game.fps;
    };
    scene.update.add(anim);
    scene.append(prev);
  });
};

const createEndingScene = (isAtsumaru: boolean) => {
  const scene = new g.Scene({ game: g.game });
  scene.loaded.add(() => {
    let panel: g.E;
    if (isAtsumaru) {
      panel = createReplay(scene);
      window.RPGAtsumaru.scoreboards
        .setRecord(BOARD_ID, g.game.vars.gameState.score)
        .then(() => window.RPGAtsumaru.scoreboards.display(BOARD_ID));
    } else {
      panel = new g.SystemLabel({
        scene,
        fontSize: 60,
        text: "終了！",
        x: g.game.width - 100,
        y: g.game.height - 30,
        textAlign: g.TextAlign.Center,
      });
    }
    panel.hide();
    scene.append(panel);
  });
  return scene;
};

export default createEndingScene;
