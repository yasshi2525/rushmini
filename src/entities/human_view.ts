import Human from "../models/human";
import creators from "./creator";
import { createSquareSprite } from "./sprite";

creators.put(Human, (scene, _) => createSquareSprite(scene, "human_basic"));
