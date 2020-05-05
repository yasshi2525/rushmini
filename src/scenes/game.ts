import controller from "../entities/controller";
import ticker, { EventType as TickEventType } from "../utils/ticker";

const paddingRatio = 0.1;

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
      "station_basic",
      "station_candidate",
      "station_covered",
      "train_basic",
    ],
  });
  ticker.register(scene);
  return {
    scene,
    prepare: (next: g.Scene) => {
      scene.loaded.add(() => {
        controller.init(scene);

        // 制限時間がなくなれば遷移する
        preserveShift(next);
      });
    },
  };
};

export default createGameScene;
