import Human from "../models/human";
import { ModelModifier } from "./connector";

export const humanModifier: ModelModifier<Human> = (vo) => {
  if (vo.subject.isOnTrain()) {
    vo.viewer.hide();
  } else if (!vo.viewer.visible()) {
    vo.viewer.show();
  }
};
