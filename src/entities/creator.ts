import Company from "../models/company";
import Human from "../models/human";
import { Pointable } from "../models/pointable";
import Residence from "../models/residence";
import Station from "../models/station";
import Train from "../models/train";
import createPointableView from "./point_view";
import { registerRailEdgeView } from "./rail_edge_view";
import { createSquareSprite } from "./sprite";
import { generateTrainCreator } from "./train_view";

export type ViewCreator<T extends Pointable> = (
  scene: g.Scene,
  subject: T
) => g.E;

/**
 * クラスとビューア作成関数のマッピング
 */
export type CreatorMapper<T extends Pointable> = {
  key: new (...args: any[]) => T;
  /**
   * 指定されたモデルに対応するビューアを作成する関数
   */
  creator: ViewCreator<T>;
};

const _storage: CreatorMapper<Pointable>[] = [];

/**
 * 指定されたエンティティをモデルの位置に移動させます。
 * エンティティの中心はモデルの中心を差します
 * @param scene
 * @param subject
 * @param core
 */
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
  reset: () => {
    _storage.length = 0;
  },

  /**
   * 指定されたクラスに対応するビューア作成関数を返します。
   * ビューアはモデルの座標に位置合わせしています
   */
  find: <T extends Pointable>(
    key: new (...args: any[]) => T
  ): ViewCreator<T>[] => {
    return _storage
      .filter((entry) => entry.key === key)
      .map((entry) => (scene, subject) =>
        adjust(scene, subject, entry.creator(scene, subject))
      );
  },

  /**
   * 指定されたビューア作成関数を登録します
   */
  put: <T extends Pointable>(
    key: new (...args: any[]) => T,
    creator: ViewCreator<T>
  ) => _storage.push({ key, creator }),

  init: () => {
    creators.put(Company, (scene, _) =>
      createSquareSprite(scene, "company_basic")
    );
    creators.put(Residence, (scene, _) =>
      createSquareSprite(scene, "residence_basic")
    );
    creators.put(Station, (scene, _) =>
      createSquareSprite(scene, "station_basic")
    );
    creators.put(Train, generateTrainCreator);
    creators.put(Human, (scene, _) => createSquareSprite(scene, "human_basic"));
    registerRailEdgeView();
  },
};

export default creators;
