import Residence from "../models/residence";
import creators from "./creator";
import { createFramedRect } from "./rectangle";

const width = 10;
const height = 10;
const cssColor = "#cd5c5c";

creators.put(Residence, (scene, _) =>
  createFramedRect(scene, width, height, cssColor)
);
