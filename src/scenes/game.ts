import preserveEntityCreator from "../entities/loader";
import { RPGAtsumaruWindow } from "../parameterObject";
import scenes, { SceneType } from "../utils/scene";
import scorer from "../utils/scorer";
import statics from "../utils/statics";
import ticker, { EventType as TickEventType } from "../utils/ticker";
import viewer from "../utils/viewer";

declare const window: RPGAtsumaruWindow;

const createGameScene = (isAtsumaru: boolean) => {
  const scene = new g.Scene({ game: g.game });
  ticker.register(scene);
  scene.loaded.add(() => {
    (g.game.assets["start_sound"] as g.AudioAsset).stop();
    (g.game.assets["game_bgm"] as g.AudioAsset).play();
    preserveEntityCreator();
    viewer.init(scene);
    if (isAtsumaru) {
      window.RPGAtsumaru.screenshot.setTweetMessage({
        tweetText: `私は ${
          statics._commute.length
        } 人の通勤客を電車で運びました。(SCORE: ${scorer.get()}) #出勤のお時間です！`,
      });
    }

    // 制限時間がなくなれば遷移する
    // ゲーム時間が終わったらエンディングシーンに遷移させる
    ticker.triggers.find(TickEventType.OVER).register(() => {
      scenes.replace(SceneType.ENDING);
    });
  });
  return scene;
};

export default createGameScene;
