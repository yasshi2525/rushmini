import createBonusPanel from "../entities/bonus";
import createModelViewer from "../entities/model_viewer";
import createRailBuilder from "../entities/railbuilder";
import createRailBuildGuide from "../entities/railbuild_guide";
import { createPaddingRect } from "../entities/rectangle";
import createScoreLabel from "../entities/score";
import createTickLabel from "../entities/tick";
import cityResource from "../models/city_resource";
import modelListener, { EventType as ModelEventType } from "../models/listener";
import random from "../utils/random";
import routeFinder from "../utils/route_finder";
import stepper from "../utils/stepper";
import ticker, { EventType as TickEventType } from "../utils/ticker";
import transportFinder from "../utils/transport_finder";

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

const initController = (width: number, height: number) => {
  transportFinder.init();
  routeFinder.init();
  stepper.init();
  cityResource.init(width, height, (min, max) => random.random().get(min, max));
  modelListener.fire(ModelEventType.CREATED);
  ticker.triggers.find(TickEventType.TICKED).register(() => stepper.step());
};

const createGameScene = (): GameScene => {
  const scene = new g.Scene({ game: g.game, name: "game" });
  ticker.register(scene);
  return {
    scene,
    prepare: (next: g.Scene) => {
      scene.loaded.add(() => {
        scene.append(createPaddingRect(scene, 0, "#ffffff"));
        const container = createPaddingRect(
          scene,
          g.game.height * paddingRatio,
          "#ffffff",
          1
        );
        container.append(createModelViewer(scene));
        container.append(createRailBuilder(scene));
        container.append(createRailBuildGuide(scene));
        container.append(createTickLabel(scene));
        container.append(createScoreLabel(scene));
        container.append(createBonusPanel(scene));
        scene.append(container);
        initController(container.width, container.height);
        // 制限時間がなくなれば遷移する
        preserveShift(next);
      });
    },
  };
};

export default createGameScene;
