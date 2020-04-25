import createBackground from "../entities/background";
import createCityBuilder from "../entities/citybuilder";
import createCityViewer from "../entities/cityviewer";
import createRailBuilder from "../entities/railbuilder";
import createRailBuildGuide from "../entities/railbuild_guide";
import createRailViewer from "../entities/railviewer";
import createScoreLabel from "../entities/score";
import createTickLabel from "../entities/tick";
import ticker, { EventType } from "../utils/ticker";

export type GameScene = {
  scene: g.Scene;
  prepare: (endingScene: g.Scene) => void;
};

const preserveShift = (next: g.Scene) => {
  // ゲーム時間が終わったらエンディングシーンに遷移させる
  ticker.triggers.find(EventType.OVER).register(() => {
    g.game.replaceScene(next);
  });
};

const createGameScene = (): GameScene => {
  const scene = new g.Scene({ game: g.game, name: "game" });
  ticker.register(scene);
  return {
    scene,
    prepare: (next: g.Scene) => {
      scene.loaded.add(() => {
        scene.append(createBackground(scene));
        const cityViewer = createCityViewer(scene);
        scene.append(cityViewer);
        createCityBuilder(cityViewer);
        scene.append(createRailViewer(scene));
        scene.append(createRailBuilder(scene));
        scene.append(createRailBuildGuide(scene));
        scene.append(createTickLabel(scene));
        scene.append(createScoreLabel(scene));
        // 制限時間がなくなれば遷移する
        preserveShift(next);
      });
    },
  };
};

export default createGameScene;
