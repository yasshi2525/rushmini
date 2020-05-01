import Human from "../models/human";
import creators from "./creator";
import { createFramedRect } from "./rectangle";

const width = 4;
const height = 8;
const cssColor = "#800000";

creators.put(Human, (parent, _) =>
  createFramedRect(parent, width, height, cssColor)
);
