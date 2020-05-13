import { ViewerEvent } from "../utils/viewer";
import createBonusComponent from "./bonus_component";

const LABEL = "宅地開発";
const INDEX = 3;

const createBonusResidence = (loadedScene: g.Scene) =>
  createBonusComponent(
    loadedScene,
    LABEL,
    INDEX,
    ViewerEvent.RESIDENCE_STARTED
  );

export default createBonusResidence;
