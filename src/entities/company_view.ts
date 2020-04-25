import Company from "../models/company";
import { ViewerCreator } from "./factory";
import createPointableView from "./point_view";

const width = 10;
const height = 10;
const cssColor = "#2266ff";

const createCompanyPanel: ViewerCreator<Company> = (
  loadedScene: g.Scene,
  c: Company
) => {
  const panel = createPointableView(loadedScene, c, width, height);

  panel.append(
    new g.FilledRect({
      scene: loadedScene,
      width,
      height,
      cssColor,
    })
  );

  return panel;
};

export default createCompanyPanel;
