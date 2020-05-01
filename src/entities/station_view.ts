import Station from "../models/station";
import creators from "./creator";
import { createFramedRect } from "./rectangle";

const width = 20;
const height = 20;
const cssColor = "#32cd32";

creators.put(Station, (scene, _) =>
  createFramedRect(scene, width, height, cssColor)
);
