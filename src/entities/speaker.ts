import scenes from "../utils/scene";
import { createSquareSprite } from "./sprite";

const MARGIN_RATE = 0.1;

const createSpeakerButton = (loadedScene: g.Scene) => {
  const panel = new g.E({
    scene: loadedScene,
    x: g.game.width * (1 - MARGIN_RATE),
    y: g.game.height * (1 - MARGIN_RATE),
  });
  const on = createSquareSprite(loadedScene, "speaker_on_img");
  on.x = -on.width;
  on.y = -on.height;
  on.touchable = true;
  if (scenes.isMute) on.hide();
  on.modified();
  panel.append(on);

  const off = createSquareSprite(loadedScene, "speaker_off_img");
  off.x = -off.width;
  off.y = -off.height;
  off.touchable = true;
  if (!scenes.isMute) off.hide();
  off.modified();
  panel.append(off);

  on.pointUp.add(() => {
    on.hide();
    off.show();
    (g.game.assets["start_sound"] as g.AudioAsset).stop();
    scenes.isMute = true;
  });

  off.pointUp.add(() => {
    off.hide();
    on.show();
    (g.game.assets["start_sound"] as g.AudioAsset).play();
    scenes.isMute = false;
  });

  return panel;
};

export default createSpeakerButton;
