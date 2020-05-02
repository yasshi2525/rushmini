import Train from "../models/train";
import creators from "./creator";
import { createFramedRect } from "./rectangle";
import { createSquareSprite } from "./sprite";

const scale = 1 / 8;

creators.put(Train, (scene, _) =>
  createSquareSprite(scene, "train_image", scale)
);
