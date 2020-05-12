import userResource from "../models/user_resource";
import { ViewerEvent } from "../utils/viewer";
import createBonusComponent from "./bonus_component";

const LABEL = "電車増発";
const INDEX = 2;

const createBonusTrain = (loadedScene: g.Scene) => {
  const panel = createBonusComponent(
    loadedScene,
    LABEL,
    INDEX,
    ViewerEvent.TRAIN_ENDED
  );
  panel.pointUp.add(() => userResource.train());
  return panel;
};

export default createBonusTrain;
