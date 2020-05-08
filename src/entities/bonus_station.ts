import { ViewerEvent } from "../utils/viewer";
import createBonusComponent from "./bonus_component";

const LABEL = "新駅建設";
const INDEX = 0;

const createBonusStation = (loadedScene: g.Scene) =>
  createBonusComponent(loadedScene, LABEL, INDEX, ViewerEvent.STATION_STARTED);

export default createBonusStation;
