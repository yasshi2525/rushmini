import Company from "../models/company";
import creators from "./creator";
import { createFramedRect } from "./rectangle";

const width = 10;
const height = 10;
const cssColor = "#4169e1";

creators.put(Company, (scene, _) =>
  createFramedRect(scene, width, height, cssColor)
);
