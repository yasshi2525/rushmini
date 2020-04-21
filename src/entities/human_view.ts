import { ViewerCreator } from "./factory";
import Human from "../models/human";

const createHumanPanel: ViewerCreator<Human> = (
  loadedScene: g.Scene,
  human: Human
) => {
  return new g.E({ scene: loadedScene });
};
