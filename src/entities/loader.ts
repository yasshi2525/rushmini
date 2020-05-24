import viewer, { ViewerType } from "../utils/viewer";
import createBonusPanel from "./bonus";
import createBonusBadge from "./bonus_badge";
import createBonusBranch from "./bonus_branch";
import createBonusResidence from "./bonus_residence";
import createBonusStation from "./bonus_station";
import createBonusTrain from "./bonus_train";
import createUndoButton from "./bonus_undo";
import createBranchBuilder from "./branch_builder";
import createRailBuildGuide from "./build_guide";
import createBuilder from "./builder";
import createFrame from "./frame";
import createHelp from "./help";
import createHumanDespawner from "./human_despawner";
import createModelViewer from "./model_viewer";
import createResidenceBuilder from "./residence_builder";
import createScoreLabel from "./score";
import createScoreViewer from "./score_view";
import createShadow from "./shadow";
import createStationBuilder from "./station_builder";
import createTickLabel from "./tick";
import createWaitPanel from "./waiter";

/**
 * ビューアの情報を utils/viewer に渡します
 */
const preserveEntityCreator = () => {
  viewer.put(ViewerType.FRAME, createFrame);
  viewer.put(ViewerType.BONUS_BADGE, createBonusBadge);
  viewer.put(ViewerType.BONUS_BRANCH, createBonusBranch);
  viewer.put(ViewerType.BONUS_STATION, createBonusStation);
  viewer.put(ViewerType.BONUS_RESIDENCE, createBonusResidence);
  viewer.put(ViewerType.BONUS_TRAIN, createBonusTrain);
  viewer.put(ViewerType.BONUS_UNDO, createUndoButton);
  viewer.put(ViewerType.BONUS, createBonusPanel);
  viewer.put(ViewerType.BRANCH_BUILDER, createBranchBuilder);
  viewer.put(ViewerType.BUILD_GUIDE, createRailBuildGuide);
  viewer.put(ViewerType.BUILDER, createBuilder);
  viewer.put(ViewerType.DESPAWNER, createHumanDespawner);
  viewer.put(ViewerType.HELP, createHelp);
  viewer.put(ViewerType.MODEL, createModelViewer);
  viewer.put(ViewerType.RESIDENCE_BUILDER, createResidenceBuilder);
  viewer.put(ViewerType.SCORE, createScoreLabel);
  viewer.put(ViewerType.SCORER, createScoreViewer);
  viewer.put(ViewerType.STATION_BUILDER, createStationBuilder);
  viewer.put(ViewerType.SHADOW, createShadow);
  viewer.put(ViewerType.TICK, createTickLabel);
  viewer.put(ViewerType.WAITER, createWaitPanel);
};

export default preserveEntityCreator;
