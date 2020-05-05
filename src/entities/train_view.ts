import Train from "../models/train";
import creators from "./creator";
import { createSquareSprite } from "./sprite";

creators.put(Train, (scene, _) => createSquareSprite(scene, "train_basic"));
