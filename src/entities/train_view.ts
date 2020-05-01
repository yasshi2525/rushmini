import Train from "../models/train";
import creators from "./creator";
import { createFramedRect } from "./rectangle";

const width = 40;
const height = 8;
const cssColor = "#ee82ee";

creators.put(Train, (scene, _) =>
  createFramedRect(scene, width, height, cssColor)
);
