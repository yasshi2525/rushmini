import { GameMainParameterObject, RPGAtsumaruWindow } from "./parameterObject";
import createEndingScene, { handleEnding } from "./scenes/ending";
import createGameScene from "./scenes/game";
import createTitleScene from "./scenes/title";
import random from "./utils/random";
import scenes, { SceneType } from "./utils/scene";
import scorer from "./utils/scorer";
import ticker from "./utils/ticker";

declare const window: RPGAtsumaruWindow;

const _gameState = {
  score: 0,
  playThreshold: 0,
  clearThreshold: 0,
};

/**
 * ゲームの初期設定
 * @param param
 */
const init = (param: GameMainParameterObject) => {
  // 制限時間の設定
  ticker.init(g.game.fps, param.sessionParameter.totalTimeLimit);
  // 共通seed値の設定
  random.init(param.random);
  // 変数の初期化
  g.game.vars = { gameState: _gameState };
  // 得点計算機の初期化
  scorer.init(_gameState);
};

const createScenes = (isAtsumaru: boolean) => {
  scenes.put(SceneType.TITLE, createTitleScene);
  scenes.put(SceneType.GAME, createGameScene);
  scenes.put(SceneType.ENDING, () => createEndingScene(isAtsumaru));
  scenes.register(SceneType.ENDING, handleEnding);
};

export const main = (param: GameMainParameterObject) => {
  if (param.isAtsumaru) {
    window.RPGAtsumaru.screenshot.setScreenshotHandler(() => {
      const pngData = document
        .getElementsByTagName("canvas")[0]
        .toDataURL("image/png");
      return Promise.resolve(pngData);
    });
  }
  init(param);
  createScenes(param.isAtsumaru);
  g.game.pushScene(scenes._scenes[SceneType.TITLE]);
};
