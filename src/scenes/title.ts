import createInstraction from "../entities/instraction";
import scenes, { SceneType } from "../utils/scene";
import ticker from "../utils/ticker";

const createTitleScene = () => {
  const scene = new g.Scene({ game: g.game });
  ticker.register(scene);
  scene.loaded.add(() => {
    scene.append(createInstraction(scene));
  });
  return scene;
};

export default createTitleScene;
