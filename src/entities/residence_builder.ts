import cityResource from "../models/city_resource";
import Point from "../models/point";
import viewer, { ViewerEvent } from "../utils/viewer";

const SIZE = 0.8;
const handleOnSelected = (ev: g.PointUpEvent) => {
  const pos = new Point(
    ev.point.x + ev.startDelta.x,
    ev.point.y + ev.startDelta.y
  );
  cityResource.residence(pos.x, pos.y);
  viewer.fire(ViewerEvent.RESIDENCE_ENDED);
};

const createInstraction = (scene: g.Scene) =>
  new g.SystemLabel({
    scene,
    text: "マップをクリックorタップして住宅を建設しよう",
    fontSize: 20,
    x: (g.game.width * SIZE) / 2,
    y: 20 * 2,
    textAlign: g.TextAlign.Center,
  });

const createResidenceBuilder = (loadedScene: g.Scene) => {
  const panel = new g.Pane({
    scene: loadedScene,
    x: (g.game.width * (1 - SIZE)) / 2,
    y: (g.game.height * (1 - SIZE)) / 2,
    width: g.game.width * SIZE,
    height: g.game.height * SIZE,
    touchable: true,
  });

  panel.append(createInstraction(loadedScene));

  panel.pointUp.add((ev) => handleOnSelected(ev));

  panel.hide();
  return panel;
};

export default createResidenceBuilder;
