import ViewObjectFactory from "./factory";
import { ListenerContainer } from "../models/listener";

/**
 * モデルの変化にあわせて描画物を作成・削除します
 * @param factory
 * @param listener
 */
const connect = <T>(
  factory: ViewObjectFactory<T>,
  listener: ListenerContainer<T>
) => {
  listener.register({
    onDone: (subject: T) => {
      factory.createInstance(subject);
    },
    onDelete: (subject: T) => {
      factory.removeSubject(subject);
    },
  });
};

export default connect;
