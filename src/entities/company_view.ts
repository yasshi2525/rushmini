import Company from "../models/company";
import creators from "./creator";
import { createSquareSprite } from "./sprite";

creators.put(Company, (scene, _) => createSquareSprite(scene, "company_image"));
