import advices, { Advice } from "../models/advice";
import { remove } from "../utils/common";
import scenes from "../utils/scene";
import ticker from "../utils/ticker";
import { createSquareSprite } from "./sprite";

const COLOR = "#696969";
const ALPHA = 0.75;
const SUSPEND_SEC = 10;

const createAdviceView = (loadedScene: g.Scene) => {
  if (!scenes.isAdvice) return new g.E({ scene: loadedScene });
  const panel = new g.E({
    scene: loadedScene,
    x: g.game.width * 0.025,
    y: g.game.height - 70,
    width: g.game.width * 0.95,
    height: 70,
  });
  const bg = new g.FilledRect({
    scene: loadedScene,
    width: panel.width,
    height: panel.height,
    cssColor: COLOR,
    opacity: ALPHA,
  });
  panel.append(bg);

  const instructor = createSquareSprite(loadedScene, "instructor_basic");
  instructor.x = -15;
  instructor.modified();
  panel.append(instructor);

  let suspend = 0;
  let guide1: g.E;
  let guide2: g.E;
  let pointer: g.E;
  let current: Advice;

  const destroyIf = () => {
    if (guide1) {
      guide1.destroy();
      guide1 = undefined;
    }
    if (guide2) {
      guide2.destroy();
      guide2 = undefined;
    }
    if (pointer) {
      pointer.destroy();
      pointer = undefined;
    }
  };

  const view = (adv: Advice) => {
    destroyIf();
    current = adv;
    guide1 = createSquareSprite(loadedScene, `advice_${adv.guide}_1_txt`);
    guide1.x = 75;
    guide1.y = 0;
    guide1.modified();
    panel.append(guide1);

    guide2 = createSquareSprite(loadedScene, `advice_${adv.guide}_2_txt`);
    guide2.x = 75;
    guide2.y = 32.5;
    guide2.modified();
    panel.append(guide2);

    if (adv.pointer) {
      pointer = createSquareSprite(loadedScene, "advice_pointer_img");
      pointer.x = adv.pointer.x - 50 + g.game.width * 0.1;
      pointer.y = adv.pointer.y - 50 + g.game.height * 0.1;
      pointer.update.add(() => {
        if (adv.pointer === undefined) {
          pointer.hide();
          return;
        }
        pointer.x = adv.pointer.x - 50 + g.game.width * 0.1;
        pointer.y = adv.pointer.y - 50 + g.game.height * 0.1;
        pointer.modified();
        pointer.show();
      });
      loadedScene.append(pointer);
    }
    suspend = ticker.fps() * SUSPEND_SEC;
    panel.show();
    remove(advices.list, adv);
  };

  panel.update.add(() => {
    // 閉じるべきものがあれば消す
    if (current?.shouldClose()) {
      destroyIf();
      suspend = 0;
    }
    // 強制上書きするものがあれば差し込む
    for (let adv of advices.list) {
      if (adv.forceOverride && adv.shouldFired()) {
        view(adv);
        return;
      }
    }
    // 一定期間表示させる
    if (suspend > 0) {
      suspend--;
      return;
    }
    // 猶予後も表示しなければならなければ表示
    if (current?.shouldKeep()) return;

    // 表示させるものがあれば表示
    for (let adv of advices.list) {
      if (adv.shouldFired()) {
        view(adv);
        return;
      }
    }

    // 表示するものがなければ隠す
    destroyIf();
    panel.hide();
  });

  return panel;
};

export default createAdviceView;
