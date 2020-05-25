import createLogo from "../entities/logo";
import createSpeakerButton from "../entities/speaker";
import { createSquareSprite } from "../entities/sprite";
import scenes, { SceneType } from "../utils/scene";
import ticker from "../utils/ticker";

const WAIT_SEC = 6;

const createTitleScene = () => {
  const scene = new g.Scene({ game: g.game, name: "title" });
  ticker.register(scene);
  scene.loaded.add(() => {
    if (!scenes.isMute) (g.game.assets["start_sound"] as g.AudioAsset).play();
    scene.pointUpCapture.add((ev) => {
      // ミュートボタンが押された際は遷移しない
      if (!ev?.target?.touchable) scenes.replace(SceneType.INSTRUCTION);
    });
    scene.append(createLogo(scene));
    scene.append(createSpeakerButton(scene));
    const trainlostbugBg = new g.FilledRect({
      scene,
      x: (g.game.width - 650) / 2,
      y: 5,
      width: 650,
      height: 100,
      cssColor: "#444444",
      opacity: 0.8,
    });
    scene.append(trainlostbugBg);
    const trainlostbug1 = createSquareSprite(
      scene,
      "traindiscardbug_20200525_1_txt"
    );
    trainlostbug1.x = 30;
    trainlostbug1.y = 5;
    trainlostbug1.modified();
    trainlostbugBg.append(trainlostbug1);
    const trainlostbug2 = createSquareSprite(
      scene,
      "traindiscardbug_20200525_2_txt"
    );
    trainlostbug2.x = 30;
    trainlostbug2.y = 37;
    trainlostbug2.modified();
    trainlostbugBg.append(trainlostbug2);
    const trainlostbug3 = createSquareSprite(
      scene,
      "traindiscardbug_20200525_3_txt"
    );
    trainlostbug3.x = 440;
    trainlostbug3.y = 70;
    trainlostbug3.modified();
    trainlostbugBg.append(trainlostbug3);

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
