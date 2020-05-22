import Platform from "../models/platform";
import Station from "../models/station";
import { find } from "../utils/common";
import { ViewObject } from "./factory";
import { animateFull } from "./rectangle";

export const stationModifier = (vo: ViewObject<Station>) => {
  const sprite = vo.viewer.children[0];
  const st = vo.subject;
  if (find(st.platforms, (p) => p.numUsed() === Platform.CAPACITY)) {
    animateFull(
      sprite,
      () =>
        find(st.platforms, (p) => p.numUsed() === Platform.CAPACITY) ===
        undefined
    );
  }
};
