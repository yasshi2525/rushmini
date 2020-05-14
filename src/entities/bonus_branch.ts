import { ViewerEvent } from "../utils/viewer";
import createBonusComponent from "./bonus_component";

const INDEX = 1;

const createBonusBranch = (loadedScene: g.Scene) =>
  createBonusComponent(loadedScene, "rail", INDEX, ViewerEvent.BRANCH_STARTED);

export default createBonusBranch;
