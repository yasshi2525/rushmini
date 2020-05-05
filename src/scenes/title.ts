import createInstraction from "../entities/instraction";
import ticker from "../utils/ticker";

/**
 * タイトルシーンと、ゲームシーンを遷移先に登録するメソッド
 */
export type TitleScene = {
  scene: g.Scene;
  prepare: (gameScene: g.Scene) => void;
};

/**
 * 次の画面への遷移条件を登録する
 * @param panel
 * @param next
 */
const preserveShift = (panel: g.E, next: g.Scene) => {
  panel.pointUp.add(() => {
    g.game.replaceScene(next);
  });
};

const createTitleScene = (): TitleScene => {
  const scene = new g.Scene({ name: "title", game: g.game });
  ticker.register(scene);
  return {
    scene,
    prepare: (next: g.Scene) => {
      scene.loaded.add(() => {
        const panel = createInstraction(scene);
        // ガイドパネルが押下されたならば、ゲームを開始する
        preserveShift(panel, next);
        scene.append(panel);
      });
    },
  };
};

export default createTitleScene;
