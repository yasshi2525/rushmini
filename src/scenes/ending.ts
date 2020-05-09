import createReplay from "../entities/replay";
import { RPGAtsumaruWindow } from "../parameterObject";

declare const window: RPGAtsumaruWindow;
const BOARD_ID = 1;

export type EndingScene = {
  scene: g.Scene;
  prepare: (titleScene: g.Scene) => void;
};

const preserveShift = (panel: g.E, next: g.Scene) => {
  panel.pointUp.add(() => g.game.replaceScene(next));
};

const createEndingScene = (isAtsumaru: boolean): EndingScene => {
  const scene = new g.Scene({ game: g.game, name: "ending" });
  return {
    scene,
    prepare: (next: g.Scene) => {
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
            x: g.game.width / 2,
            y: g.game.height / 2 - 30,
            textAlign: g.TextAlign.Center,
          });
        }
        preserveShift(panel, next);
        scene.append(panel);
      });
    },
  };
};

export default createEndingScene;
