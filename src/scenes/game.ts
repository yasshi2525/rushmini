import preserveEntityCreator from "../entities/loader";
import ticker, { EventType as TickEventType } from "../utils/ticker";
import viewer from "../utils/viewer";

export type GameScene = {
  scene: g.Scene;
  prepare: (endingScene: g.Scene) => void;
};

const preserveShift = (next: g.Scene) => {
  // ゲーム時間が終わったらエンディングシーンに遷移させる
  ticker.triggers.find(TickEventType.OVER).register(() => {
    g.game.replaceScene(next);
  });
};

const createGameScene = (): GameScene => {
  const scene = new g.Scene({
    game: g.game,
    name: "game",
    assetIds: [
      "company_basic",
      "human_basic",
      "residence_basic",
      "residence_bonus_enabled",
      "residence_bonus_disabled",
      "station_basic",
      "station_candidate",
      "station_covered",
      "station_bonus_enabled",
      "station_bonus_disabled",
      "train_basic",
      "train_bonus_enabled",
      "train_bonus_disabled",
      "rail_bonus_enabled",
      "rail_bonus_disabled",
      "finger_basic",
      "finger_touch_basic",
      "build_txt",
      "station_txt",
      "branch_txt",
      "residence_txt",
      "bonus_txt",
      "frame_main",
      "score_main",
      "score_main_glyphs",
      "score_negative",
      "score_negative_glyphs",
      "score_positive",
      "score_positive_glyphs",
    ],
  });
  ticker.register(scene);
  return {
    scene,
    prepare: (next: g.Scene) => {
      scene.loaded.add(() => {
        preserveEntityCreator();
        viewer.init(scene);

        // 制限時間がなくなれば遷移する
        preserveShift(next);
      });
    },
  };
};

export default createGameScene;
