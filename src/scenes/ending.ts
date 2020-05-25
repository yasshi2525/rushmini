import createFrame from "../entities/frame";
import createReplay from "../entities/replay";
import createScoreLabel from "../entities/score";
import { createSquareSprite } from "../entities/sprite";
import createStaticsPanel from "../entities/statics_view";
import { RPGAtsumaruWindow } from "../parameterObject";
import scenes from "../utils/scene";

declare const window: RPGAtsumaruWindow;
const BOARD_ID = 1;

/**
 * ゲーム中に作成したスクリーンショットを表示する
 * @param prev
 */
export const handleEnding = (prev: g.E) => {
  const scene = prev.scene;
  const frame = createFrame(scene);
  prev.x = (frame.width - prev.width) / 2;
  prev.y = (frame.height - prev.height) / 2;
  frame.append(prev);
  frame.anchor(0, 0);

  scene.loaded.add(() => {
    if (!scenes.isMute) {
      (g.game.assets["game_bgm"] as g.AudioAsset).stop();
      (g.game.assets["end_sound"] as g.AudioAsset).play();
    }
    let scale = 1;
    const anim = () => {
      if (scale < 0.66) {
        scene.update.remove(anim);
        scene.children[0].show();
        const score = createScoreLabel(scene);
        score.x += 40;
        score.modified();
        scene.append(score);
        scene.append(createStaticsPanel(scene));
        return;
      }
      frame.scale(scale);
      frame.modified();
      scale -= 0.33 / g.game.fps;
      frame.x -= (g.game.width * 0.05) / g.game.fps;
      frame.y -= (g.game.height * 0.05) / g.game.fps;
    };
    scene.update.add(anim);
    scene.append(frame);
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
      panel = createSquareSprite(scene, "ending_txt");
      panel.x = g.game.width - panel.width;
      panel.y = g.game.height - panel.height;
      panel.modified();
    }
    panel.hide();
    scene.append(panel);
  });
  return scene;
};

export default createEndingScene;
