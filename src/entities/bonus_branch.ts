import createBonusComponent from "./bonus_component";

const LABEL = "支線建設";
const INDEX = 1;

const createBonusBranch = (loadedScene: g.Scene, onSelected: () => void) =>
  createBonusComponent(loadedScene, LABEL, INDEX, onSelected);

export default createBonusBranch;
