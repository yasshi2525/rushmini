import Company from "../models/company";
import creators from "./creator";
import { createFramedRect } from "./rectangle";
import { createSquareSprite } from "./sprite";

const scale = 1 / 4;

creators.put(Company, (scene, _) =>
  createSquareSprite(scene, "company_image", scale)
);
