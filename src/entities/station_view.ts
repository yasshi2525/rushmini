import Platform from "../models/platform";
import Station from "../models/station";
import { find } from "../utils/common";
import { ViewObject } from "./factory";
import { createSquareSprite } from "./sprite";

export const stationModifier = (vo: ViewObject<Station>) => {
  const panel = vo.viewer.children[0];
  const st = vo.subject;
  const g = st.gate;
  if (g.inQueue.length < 10) {
    panel.children[1].hide();
    panel.children[2].hide();
  } else if (g.inQueue.length < 50) {
    panel.children[1].show();
    panel.children[2].hide();
  } else {
    panel.children[1].hide();
    panel.children[2].show();
  }
};

export const generateStationCreator = (scene: g.Scene, _: Station) => {
  const panel = new g.E({ scene });
  const sprite = createSquareSprite(scene, "station_basic");
  panel.append(sprite);
  const crowed1 = createSquareSprite(scene, "crowed_level1_img");
  crowed1.x = (sprite.width - crowed1.width) / 2;
  crowed1.y = sprite.height / 3;
  crowed1.modified();
  crowed1.hide();
  panel.append(crowed1);
  const crowed2 = createSquareSprite(scene, "crowed_level2_img");
  crowed2.x = (sprite.width - crowed2.width) / 2;
  crowed2.y = sprite.height / 3;
  crowed2.modified();
  crowed2.hide();
  panel.append(crowed2);
  panel.width = sprite.width;
  panel.height = sprite.height;
  panel.modified();
  return panel;
};
