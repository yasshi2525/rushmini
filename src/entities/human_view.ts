import Human from "../models/human";
import { ModelModifier } from "./connector";
import creators from "./creator";
import { createSquareSprite } from "./sprite";

export const humanModifier: ModelModifier<Human> = (vo) => {
  if (vo.subject.isOnTrain()) {
    vo.viewer.hide();
  } else if (!vo.viewer.visible()) {
    vo.viewer.show();
  }
};

creators.put(Human, (scene, _) => createSquareSprite(scene, "human_basic"));
