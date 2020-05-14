import { ViewerEvent } from "../utils/viewer";
import createBonusComponent from "./bonus_component";

const INDEX = 3;

const createBonusResidence = (loadedScene: g.Scene) =>
  createBonusComponent(
    loadedScene,
    "residence",
    INDEX,
    ViewerEvent.RESIDENCE_STARTED
  );

export default createBonusResidence;
