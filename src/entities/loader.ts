import viewer, { ViewerType } from "../utils/viewer";
import createBackground from "./background";
import createBonusPanel from "./bonus";
import createBonusBranch from "./bonus_branch";
import createBranchBuilder from "./branch_builder";
import createBuilder from "./builder";
import createRailBuildGuide from "./build_guide";
import createModelViewer from "./model_viewer";
import createScoreLabel from "./score";
import createShadow from "./shadow";
import createTickLabel from "./tick";

const preserveEntityCreator = () => {
  viewer.put(ViewerType.BACKGROUND, createBackground);
  viewer.put(ViewerType.BONUS_BRANCH, createBonusBranch);
  viewer.put(ViewerType.BONUS, createBonusPanel);
  viewer.put(ViewerType.BRANCH_BUILDER, createBranchBuilder);
  viewer.put(ViewerType.BUILD_GUIDE, createRailBuildGuide);
  viewer.put(ViewerType.BUILDER, createBuilder);
  viewer.put(ViewerType.MODEL, createModelViewer);
  viewer.put(ViewerType.SCORE, createScoreLabel);
  viewer.put(ViewerType.SHADOW, createShadow);
  viewer.put(ViewerType.TICK, createTickLabel);
};

export default preserveEntityCreator;
