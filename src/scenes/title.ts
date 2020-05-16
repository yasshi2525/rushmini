import createInstraction from "../entities/instraction";
import ticker from "../utils/ticker";

const createTitleScene = () => {
  const scene = new g.Scene({ game: g.game, name: "title" });
  ticker.register(scene);
  scene.loaded.add(() => {
    (g.game.assets["start_sound"] as g.AudioAsset).play();
    scene.append(createInstraction(scene));
  });
  return scene;
};

export default createTitleScene;
