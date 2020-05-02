import Residence from "../models/residence";
import creators from "./creator";
import { createFramedRect } from "./rectangle";
import { createSquareSprite } from "./sprite";

const scale = 1 / 4;

creators.put(Residence, (scene, _) =>
  createSquareSprite(scene, "residence_image", scale)
);
