import Residence from "../models/residence";
import creators from "./creator";
import { createSquareSprite } from "./sprite";

creators.put(Residence, (scene, _) =>
  createSquareSprite(scene, "residence_basic")
);
