import modelListener, { EventType, Tracker } from "../models/listener";
import { Pointable } from "../models/pointable";
import ViewObjectFactory, { ViewObject } from "./factory";

export type ModelModifier<T extends Pointable> = (vo: ViewObject<T>) => void;

/**
 * モデルが移動した場合、描画物の座標も移動させます
 * @param vo
 */
const positionModifier = <T extends Pointable>(vo: ViewObject<T>) => {
  vo.viewer.x = vo.subject.loc().x;
  vo.viewer.y = vo.subject.loc().y;
};

/**
 * モデルの変化にあわせて描画物を作成・削除します
 * @param factory
 * @param listener
 */
const connect = <T extends Pointable>(
  factory: ViewObjectFactory<T>,
  cls: new (...args: any[]) => T,
  modifier?: ModelModifier<T>
) => {
  modelListener.find(EventType.CREATED, cls).register((subject) => {
    const vo = factory.createInstance(subject);

    const tracker = new Tracker(vo.subject);
    tracker.register((h) => {
      positionModifier(vo);
      if (modifier) modifier(vo);
      vo.viewer.modified();
    });
    modelListener.track(EventType.MODIFIED, tracker);
  });
  modelListener
    .find(EventType.DELETED, cls)
    .register((subject) => factory.removeInstance(subject));
};

export default connect;
