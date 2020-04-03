import { GameMainParameterObject, RPGAtsumaruWindow } from "./parameterObject";
import { getTitleScene } from "./title";
import { getGameScene } from "./game";

declare const window: RPGAtsumaruWindow;

export const main = (param: GameMainParameterObject) => {
	var timeLimit = 60;
	if (param.sessionParameter.totalTimeLimit) {
		timeLimit = param.sessionParameter.totalTimeLimit;
	}
	g.game.vars = { 
		gameState: { score: 0 },
		remainFrame: timeLimit * g.game.fps,
		updateFrame: () => {
			if (g.game.vars.remainFrame > 0) {
				g.game.vars.remainFrame--;
			}
		}
	};
	const game = getGameScene();
	const title = getTitleScene(game);
	g.game.pushScene(title);
}
