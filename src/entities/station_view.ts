import Station from "../models/station";
import creators from "./creator";
import { createFramedRect } from "./rectangle";
import { createSquareSprite } from "./sprite";

const scale = 1 / 4;

creators.put(Station, (scene, _) =>
  createSquareSprite(scene, "station_image", scale)
);
