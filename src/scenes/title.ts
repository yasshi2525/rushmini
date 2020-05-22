import createLogo from "../entities/logo";
import scenes, { SceneType } from "../utils/scene";
import ticker from "../utils/ticker";

const WAIT_SEC = 6;

const createTitleScene = () => {
  const scene = new g.Scene({ game: g.game, name: "title" });
  ticker.register(scene);
  scene.loaded.add(() => {
    (g.game.assets["start_sound"] as g.AudioAsset).play();
    scene.pointUpCapture.add(() => {
      scenes.replace(SceneType.INSTRUCTION);
    });
    scene.append(createLogo(scene));

    let cnt = 0;
    const counter = () => {
      if (cnt > ticker.fps() * WAIT_SEC) {
        scene.update.remove(counter);
        scenes.replace(SceneType.INSTRUCTION);
      }
      cnt++;
    };
    scene.update.add(counter);
  });
  return scene;
};

export default createTitleScene;
