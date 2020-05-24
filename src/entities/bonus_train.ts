import userResource from "../models/user_resource";
import { ViewerEvent } from "../utils/viewer";
import createBonusComponent from "./bonus_component";

const INDEX = 2;

const createBonusTrain = (loadedScene: g.Scene) => {
  const panel = createBonusComponent(
    loadedScene,
    "train",
    INDEX,
    ViewerEvent.TRAIN_ENDED
  );
  panel.children[1].pointUp.add(() => {
    userResource.train();
    userResource.commit();
  });
  return panel;
};

export default createBonusTrain;
