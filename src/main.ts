import { GameMainParameterObject, RPGAtsumaruWindow } from "./parameterObject";
import { getTitleScene } from "./title";
import { getGameScene } from "./game";

declare const window: RPGAtsumaruWindow;

export function main(param: GameMainParameterObject): void {
	const game = getGameScene();
	const title = getTitleScene(game);
	g.game.pushScene(title);
}
