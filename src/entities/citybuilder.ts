import cityResource from "../models/city_resource";
import modelListener, { EventType as ModelEventType } from "../models/listener";
import random from "../utils/random";
import stepper from "../utils/stepper";
import ticker, { EventType as TickEventType } from "../utils/ticker";

/**
 * 一定間隔で人を生成・移動する
 * @param viewer
 */
const createCityBuilder = (viewer: g.E) => {
  cityResource.init(viewer.width, viewer.height, (min, max) =>
    random.random().get(min, max)
  );
  modelListener.fire(ModelEventType.CREATED);
  ticker.triggers.find(TickEventType.TICKED).register(() => stepper.step());
};

export default createCityBuilder;
