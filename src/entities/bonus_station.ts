import { ViewerEvent } from "../utils/viewer";
import createBonusComponent from "./bonus_component";

const INDEX = 0;

const createBonusStation = (loadedScene: g.Scene) =>
  createBonusComponent(
    loadedScene,
    "station",
    INDEX,
    ViewerEvent.STATION_STARTED
  );

export default createBonusStation;
