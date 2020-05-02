import Human from "../models/human";
import creators from "./creator";
import { createSquareSprite } from "./sprite";

const scale = 1 / 8;

creators.put(Human, (scene, _) =>
  createSquareSprite(scene, "human_image", scale)
);
