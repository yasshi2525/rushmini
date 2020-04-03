import { GameMainParameterObject, RPGAtsumaruWindow } from "./parameterObject";
import { getTitleScene } from "./title";
import { getGameScene } from "./game";

declare const window: RPGAtsumaruWindow;

export const main = (param: GameMainParameterObject) => {
	const game = getGameScene();
	const title = getTitleScene(game);
	g.game.pushScene(title);
}
