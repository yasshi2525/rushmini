import preserveEntityCreator from "../entities/loader";
import scenes, { SceneType } from "../utils/scene";
import ticker, { EventType as TickEventType } from "../utils/ticker";
import viewer from "../utils/viewer";

const createGameScene = () => {
  const scene = new g.Scene({ game: g.game });
  ticker.register(scene);
  scene.loaded.add(() => {
    preserveEntityCreator();
    viewer.init(scene);

    // 制限時間がなくなれば遷移する
    // ゲーム時間が終わったらエンディングシーンに遷移させる
    ticker.triggers.find(TickEventType.OVER).register(() => {
      scenes.replace(SceneType.ENDING);
    });
  });
  return scene;
};

export default createGameScene;
