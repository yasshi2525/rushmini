import { RPGAtsumaruWindow } from "parameterObject";
import createEndingScene, { handleEnding } from "scenes/ending";
import scenes, { SceneType } from "utils/scene";
import scorer from "utils/scorer";
import ticker from "utils/ticker";

declare const recreateGame: () => Promise<void>;
declare const window: RPGAtsumaruWindow;

describe("ending", () => {
  beforeEach(() => {
    window.RPGAtsumaru = {
      scoreboards: {
        setRecord: (_id: number, _score: number) =>
          new Promise<void>((resolve) => resolve()),
        display: (_: number): any => undefined,
      },
    };
    g.game.vars = { gameState: { score: 0 } };
    scorer.init(g.game.vars.gameState);
  });

  afterEach(async () => {
    await recreateGame();
  });

  it("create scene", () => {
    const scene = createEndingScene(false);
    expect(scene).not.toBeUndefined();
  });

  it("load scene", () => {
    const scene = createEndingScene(false);
    g.game.pushScene(scene);
    g.game.tick(false);
    expect(g.game.scene()).toEqual(scene);
  });

  it("replay button changes scene", () => {
    scenes.put(SceneType.TITLE, () => new g.Scene({ game: g.game }));
    const scene = createEndingScene(true);
    g.game.pushScene(scene);
    g.game.tick(false);
    g.game.scene().children[0].pointDown.fire();
    g.game.scene().children[0].pointUp.fire();
    g.game.tick(false);
    expect(g.game.scene()).not.toEqual(scene);
  });

  it("ending animation invoked from prev", () => {
    scenes.put(SceneType.ENDING, () => createEndingScene(false));
    scenes.preserve(SceneType.ENDING, (scene) => new g.E({ scene }));
    scenes.register(SceneType.ENDING, handleEnding);

    scenes.replace(SceneType.ENDING);

    g.game.tick(false);
    for (let i = 0; i < ticker.fps() + 2; i++) {
      g.game.tick(true);
    }
  });
});
