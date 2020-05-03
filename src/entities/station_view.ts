import Station from "../models/station";
import creators from "./creator";
import { createSquareSprite } from "./sprite";

creators.put(Station, (scene, _) => createSquareSprite(scene, "station_image"));
