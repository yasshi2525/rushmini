import ticker from "../utils/ticker";
import createScoreLabel from "../entities/score";
import createTickLabel from "../entities/tick";
import createRailBuildGuide from "../entities/railbuild_guide";
import createRailViewer from "../entities/railviewer";
import createRailBuilder from "../entities/railbuilder";

export type GameScene = {
  scene: g.Scene;
  prepare: (endingScene: g.Scene) => void;
};

const preserveShift = (next: g.Scene) => {
  ticker.observe(() => {
    if (ticker.isGameOver()) {
      g.game.replaceScene(next);
    }
  });
};

const createGameScene = (): GameScene => {
  const scene = new g.Scene({ game: g.game });
  ticker.register(scene);
  return {
    scene,
    prepare: (next: g.Scene) => {
      scene.loaded.add(() => {
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
