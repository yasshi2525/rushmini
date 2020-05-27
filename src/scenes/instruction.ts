import createInstruction from "../entities/instruction_guide";
import createStartButton from "../entities/start";
import scenes, { SceneType } from "../utils/scene";
import ticker from "../utils/ticker";

const WAIT_SEC = 15;

const createInstructionScene = (isAtsumaru: boolean) => {
  const scene = new g.Scene({ game: g.game });
  if (!isAtsumaru) ticker.register(scene);
  scene.loaded.add(() => {
    scene.pointUpCapture.add(() => {
      scenes.replace(SceneType.GAME);
    });
    scene.append(createInstruction(scene));
    scene.append(createStartButton(scene));

    let cnt = 0;
    const counter = () => {
      if (cnt > ticker.fps() * WAIT_SEC) {
        scene.update.remove(counter);
        scenes.replace(SceneType.GAME);
      }
      cnt++;
    };
    scene.update.add(counter);
  });
  return scene;
};

export default createInstructionScene;
