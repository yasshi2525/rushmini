import { createPaddingRect } from "./rectangle";

const createBackground = (loadedScene: g.Scene) =>
  createPaddingRect(loadedScene, 0, "#ffffff", 0);

export default createBackground;
