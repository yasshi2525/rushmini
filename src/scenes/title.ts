import createAdviceBar from "../entities/advice_bar";
import createLogo from "../entities/logo";
import createSpeakerButton from "../entities/speaker";
import { createSquareSprite } from "../entities/sprite";
import scenes, { SceneType } from "../utils/scene";
import ticker from "../utils/ticker";

const WAIT_SEC = 6;

const createTitleScene = (isAtsumaru: boolean) => {
  const scene = new g.Scene({ game: g.game, name: "title" });
  if (!isAtsumaru) ticker.register(scene);
  scene.loaded.add(() => {
    if (!scenes.isMute) (g.game.assets["start_sound"] as g.AudioAsset).play();
    scene.pointUpCapture.add((ev) => {
      // ミュートボタンが押された際は遷移しない
      if (!ev?.target?.touchable) scenes.replace(SceneType.INSTRUCTION);
    });
    scene.append(createLogo(scene));
    scene.append(createAdviceBar(scene));
    scene.append(createSpeakerButton(scene));

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
