import { TriggerContainer } from "../models/listener";

export enum SceneType {
  TITLE,
  INSTRUCTION,
  GAME,
  ENDING,
}

export type Controller = {
  _scenes: { [key in SceneType]?: g.Scene };
  _preserves: { [key in SceneType]?: g.E };
  _creators: { [key in SceneType]?: () => g.Scene };
  _listener: TriggerContainer<SceneType, g.E>;
  put: (key: SceneType, creator: () => g.Scene) => void;
  register: (key: SceneType, listener: (prev: g.E) => void) => void;
  preserve: (key: SceneType, entity: (scene: g.Scene) => g.E) => void;
  replace: (scene: SceneType, prev?: g.E) => void;
  reset: () => void;
};

const scenes: Controller = {
  _scenes: {},
  _preserves: {},
  _creators: {},
  _listener: new TriggerContainer<SceneType, g.E>(),

  put: (key, creator: () => g.Scene) => {
    scenes._creators[key] = creator;
    scenes._scenes[key] = creator();
  },
  /**
   * 指定したシーンに引き継ぐエンティティを登録します
   */
  preserve: (key, entity) => {
    scenes._preserves[key] = entity(scenes._scenes[key]);
  },
  register: (key, listener) => {
    scenes._listener.find(key).register(listener);
  },
  /**
   * 指定したシーンに遷移要求を出します。ハンドラを登録しておくことで事前作業が可能です
   */
  replace: (key) => {
    scenes._listener.add(key, scenes._preserves[key]);
    scenes._listener.fire(key);
    g.game.replaceScene(scenes._scenes[key]);
  },
  reset: () => {
    scenes._scenes = {};
    scenes._preserves = {};
    Object.keys(scenes._creators)
      .map((v) => parseInt(v, 10))
      .filter((v) => !isNaN(v))
      .forEach(
        (key: SceneType) => (scenes._scenes[key] = scenes._creators[key]())
      );
  },
};

export default scenes;
