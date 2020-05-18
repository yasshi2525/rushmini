import cityResource from "../models/city_resource";
import Point from "../models/point";
import viewer, { ViewerEvent } from "../utils/viewer";
import { createSquareSprite } from "./sprite";

const SIZE = 0.8;
const INSTRUCTION_Y = 120;

const handleOnSelected = (ev: g.PointUpEvent) => {
  const pos = new Point(
    ev.point.x + ev.startDelta.x,
    ev.point.y + ev.startDelta.y
  );
  cityResource.residence(pos.x, pos.y);
  viewer.fire(ViewerEvent.RESIDENCE_ENDED);
};

const appendInstraction = (panel: g.E) => {
  const sprite = createSquareSprite(panel.scene, "residence_txt");
  sprite.x = (panel.width - sprite.width) / 2;
  sprite.y = INSTRUCTION_Y;
  sprite.modified();
  panel.append(sprite);
};

const createResidenceBuilder = (loadedScene: g.Scene) => {
  const panel = new g.Pane({
    scene: loadedScene,
    x: (g.game.width * (1 - SIZE)) / 2,
    y: (g.game.height * (1 - SIZE)) / 2,
    width: g.game.width * SIZE,
    height: g.game.height * SIZE,
    touchable: true,
  });

  appendInstraction(panel);
  panel.pointUp.add((ev) => handleOnSelected(ev));

  panel.hide();
  return panel;
};

export default createResidenceBuilder;
