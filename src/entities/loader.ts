import viewer, { ViewerType } from "../utils/viewer";
import createBackground from "./background";
import createBonusPanel from "./bonus";
import createBonusBranch from "./bonus_branch";
import createBonusResidence from "./bonus_residence";
import createBonusStation from "./bonus_station";
import createBonusTrain from "./bonus_train";
import createBranchBuilder from "./branch_builder";
import createRailBuildGuide from "./build_guide";
import createBuilder from "./builder";
import createHumanDespawner from "./human_despawner";
import createModelViewer from "./model_viewer";
import createResidenceBuilder from "./residence_builder";
import createScoreLabel from "./score";
import createShadow from "./shadow";
import createStationBuilder from "./station_builder";
import createTickLabel from "./tick";

/**
 * ビューアの情報を utils/viewer に渡します
 */
const preserveEntityCreator = () => {
  viewer.put(ViewerType.BACKGROUND, createBackground);
  viewer.put(ViewerType.BONUS_BRANCH, createBonusBranch);
  viewer.put(ViewerType.BONUS_STATION, createBonusStation);
  viewer.put(ViewerType.BONUS_RESIDENCE, createBonusResidence);
  viewer.put(ViewerType.BONUS_TRAIN, createBonusTrain);
  viewer.put(ViewerType.BONUS, createBonusPanel);
  viewer.put(ViewerType.BRANCH_BUILDER, createBranchBuilder);
  viewer.put(ViewerType.BUILD_GUIDE, createRailBuildGuide);
  viewer.put(ViewerType.BUILDER, createBuilder);
  viewer.put(ViewerType.DESPAWNER, createHumanDespawner);
  viewer.put(ViewerType.MODEL, createModelViewer);
  viewer.put(ViewerType.RESIDENCE_BUILDER, createResidenceBuilder);
  viewer.put(ViewerType.SCORE, createScoreLabel);
  viewer.put(ViewerType.STATION_BUILDER, createStationBuilder);
  viewer.put(ViewerType.SHADOW, createShadow);
  viewer.put(ViewerType.TICK, createTickLabel);
};

export default preserveEntityCreator;
