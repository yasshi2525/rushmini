import cityResource from "../models/city_resource";
import modelListener, { EventType as ModelEventType } from "../models/listener";
import random from "../utils/random";
import routeFinder from "../utils/route_finder";
import stepper from "../utils/stepper";
import ticker, { EventType as TickEventType } from "../utils/ticker";
import transportFinder from "../utils/transport_finder";

/**
 * 一定間隔で人を生成・移動する
 * @param viewer
 */
const createCityBuilder = (viewer: g.E) => {
  transportFinder.init();
  routeFinder.init();
  stepper.init();
  cityResource.init(viewer.width, viewer.height, (min, max) =>
    random.random().get(min, max)
  );
  modelListener.fire(ModelEventType.CREATED);
  ticker.triggers.find(TickEventType.TICKED).register(() => stepper.step());
};

export default createCityBuilder;
