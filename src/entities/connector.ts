import modelListener, { EventType, Tracker } from "../models/listener";
import ViewObjectFactory, { ViewObject } from "./factory";

/**
 * モデルの変化にあわせて描画物を作成・削除します
 * @param factory
 * @param listener
 */
const connect = <T>(
  factory: ViewObjectFactory<T>,
  cls: new (...args: any[]) => T,
  modifier?: (vo: ViewObject<T>) => void
) => {
  modelListener.find(EventType.CREATED, cls).register((subject) => {
    const vo = factory.createInstance(subject);
    if (modifier) {
      const tracker = new Tracker(vo.subject);
      tracker.register((h) => modifier(vo));
      modelListener.track(EventType.MODIFIED, tracker);
    }
  });
  modelListener
    .find(EventType.DELETED, cls)
    .register((subject) => factory.removeInstance(subject));
};

export default connect;
