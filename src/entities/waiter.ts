import { appendInstruction, createWorkingArea } from "./rectangle";

const createWaitPanel = (loadedScene: g.Scene) => {
  const panel = createWorkingArea(loadedScene, {});
  appendInstruction(panel, "available_txt");
  panel.hide();
  return panel;
};

export default createWaitPanel;
