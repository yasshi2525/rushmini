import { GameMainParameterObject } from "./parameterObject";
import createTitleScene, { TitleScene } from "./scenes/title";
import createGameScene, { GameScene } from "./scenes/game";
import ticker from "./utils/ticker";
import random from "./utils/random";
import scorer from "./utils/scorer";
import createEndingScene, { EndingScene } from "./scenes/ending";

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

const createScenes = () => {
  return {
    title: createTitleScene(),
    game: createGameScene(),
    ending: createEndingScene(),
  };
};

const prepareScenes = (
  title: TitleScene,
  game: GameScene,
  ending: EndingScene
) => {
  title.prepare(game.scene);
  game.prepare(ending.scene);
  ending.prepare(title.scene);
};

export const main = (param: GameMainParameterObject) => {
  init(param);
  const scenes = createScenes();
  prepareScenes(scenes.title, scenes.game, scenes.ending);
  g.game.pushScene(scenes.title.scene);
};
