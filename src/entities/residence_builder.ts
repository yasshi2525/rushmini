import cityResource from "../models/city_resource";
import modelListener, { EventType } from "../models/listener";
import Point from "../models/point";
import viewer, { ViewerEvent } from "../utils/viewer";
import { appendInstruction, createWorkingArea } from "./rectangle";

const handleOnSelected = (ev: g.PointUpEvent) => {
  const pos = new Point(
    ev.point.x + ev.startDelta.x,
    ev.point.y + ev.startDelta.y
  );
  cityResource.residence(pos.x, pos.y);
  modelListener.fire(EventType.CREATED);
  viewer.fire(ViewerEvent.RESIDENCE_ENDED);
};

const createResidenceBuilder = (loadedScene: g.Scene) => {
  const panel = createWorkingArea(loadedScene, {
    isPane: true,
    touchable: true,
  });
  appendInstruction(panel, "residence_txt");
  panel.pointUp.add((ev) => handleOnSelected(ev));

  panel.hide();
  return panel;
};

export default createResidenceBuilder;
