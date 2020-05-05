import { Pointable } from "../models/pointable";
import { find } from "../utils/common";
import createPointableView from "./point_view";

export type ViewCreator<T extends Pointable> = (
  scene: g.Scene,
  subject: T
) => g.E;

/**
 * クラスとビューア作成関数のマッピング
 */
type CreatorMapper<T extends Pointable> = {
  key: new (...args: any[]) => T;
  /**
   * 指定されたモデルに対応するビューアを作成する関数
   */
  creator: ViewCreator<T>;
};

const _storage: CreatorMapper<Pointable>[] = [];

export const adjust = <T extends Pointable>(
  scene: g.Scene,
  subject: T,
  core: g.E
) => {
  const panel = createPointableView(scene, subject, core.width, core.height);
  panel.append(core);
  return panel;
};

const creators = {
  /**
   * 指定されたクラスに対応するビューア作成関数を返します。
   * ビューアはモデルの座標に位置合わせしています
   */
  find: <T extends Pointable>(
    key: new (...args: any[]) => T
  ): ViewCreator<T> => {
    const mapper = find(_storage, (obj) => obj.key === key);
    return (scene, subject) =>
      adjust(scene, subject, mapper.creator(scene, subject));
  },

  /**
   * 指定されたビューア作成関数を登録します
   */
  put: <T extends Pointable>(
    key: new (...args: any[]) => T,
    creator: ViewCreator<T>
  ) => _storage.push({ key, creator }),
};

export default creators;
