import { ViewerEvent } from "../utils/viewer";
import createBonusComponent from "./bonus_component";

const LABEL = "支線建設";
const INDEX = 1;

const createBonusBranch = (loadedScene: g.Scene) =>
  createBonusComponent(loadedScene, LABEL, INDEX, ViewerEvent.BRANCH_STARTED);

export default createBonusBranch;
