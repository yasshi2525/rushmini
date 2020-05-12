import cityResource from "../models/city_resource";
import modelListener, {
  EventType as ModelEventType,
  Tracker,
  TriggerContainer,
} from "../models/listener";
import userResource from "../models/user_resource";
import random from "./random";
import routeFinder from "./route_finder";
import scorer from "./scorer";
import stepper from "./stepper";
import ticker, { EventType as TickEventType } from "./ticker";
import transportFinder from "./transport_finder";

/**
 * ビューアの役割と描画順
 */
export enum ViewerType {
  /**
   * 背景
   */
  BACKGROUND,
  /**
   * モデルの描画先
   */
  MODEL,
  /**
   * 力尽きた人間の表示
   */
  DESPAWNER,
  /**
   * 鉄道建設の仕方の説明
   */
  BUILD_GUIDE,
  /**
   * 鉄道建設の入力受付
   */
  BUILDER,
  /**
   * ボーナス画面のとき、モデルを影で隠す
   */
  SHADOW,
  /**
   * 支線ボーナスの入力受付
   */
  BRANCH_BUILDER,
  /**
   * 新駅建設の入力受付
   */
  STATION_BUILDER,
  /**
   * ボーナス選択画面
   */
  BONUS,
  /**
   * 支線建設ボーナスボタン
   */
  BONUS_BRANCH,
  /**
   * 新駅建設ボーナスボタン
   */
  BONUS_STATION,
  /**
   * 残り時間の表示
   */
  TICK,
  /**
   * 獲得点数の表示
   */
  SCORE,
}

export enum ViewerEvent {
  /**
   * エンティティをシーンに貼り付ける準備ができた
   */
  INITED,
  /**
   * 路線建設が完了した
   */
  BUILT,
  /**
   * 得点が発生した
   */
  SCORED,
  /**
   * ボーナスが発火した (要:前のボーナスが終了)
   */
  BONUS_STARTED,
  /**
   * 支線ボーナスが選ばれた (駅を探し中)
   */
  BRANCH_STARTED,
  /**
   * 支線の建設中
   */
  BRANCHING,
  /**
   * 支線の建設完了
   */
  BRANCHED,
  /**
   * 新駅ボーナスが選ばれた（立地を探し中）
   */
  STATION_STARTED,
  /**
   * 新駅の建設完了
   */
  STATION_ENDED,
}

/**
 * ボーナスが発火されるボーダー点
 */
const BORDERS = [1000, 2000, 4000, 8000];

type ViewerCreator = (scene: g.Scene) => g.E;

type Controller = {
  isBonusing: boolean;
  borders: number[];
  _listener: TriggerContainer<ViewerEvent, Controller>;
  _trackers: { [key in ViewerEvent]?: Tracker<Controller> };
  creators: { [key in ViewerType]?: ViewerCreator };
  viewers: { [key in ViewerType]?: g.E };
  /**
   * ビューア作成関数を登録します
   */
  put: (key: ViewerType, creator: ViewerCreator) => void;
  /**
   * ビューアを作成し、シーンに貼り付けます
   */
  init: (scene: g.Scene) => void;
  /**
   * イベントリスナを登録します
   */
  register: (key: ViewerEvent, listener: (_c: Controller) => void) => void;
  /**
   * イベントを発火します
   */
  fire: (ev: ViewerEvent) => void;
  reset: () => void;
};

/**
 * ビューアの親子関係を返す
 * @param _c
 * @param key
 * @param scene
 */
const parent = (_c: Controller, key: ViewerType, scene: g.Scene) => {
  switch (key) {
    case ViewerType.BONUS_BRANCH:
    case ViewerType.BONUS_STATION:
      return _c.viewers[ViewerType.BONUS];
    default:
      return scene;
  }
};

const initController = (width: number, height: number) => {
  transportFinder.init();
  routeFinder.init();
  stepper.init();
  userResource.init();
  cityResource.init(width, height, (min, max) => random.random().get(min, max));
  modelListener.fire(ModelEventType.CREATED);
  ticker.triggers.find(TickEventType.TICKED).register(() => stepper.step());
};

/**
 * インスタンスを作成し、シーンに登録する
 * @param _c
 * @param scene
 */
const handleInited = (_c: Controller, scene: g.Scene) => {
  Object.keys(ViewerType)
    .map((v) => parseInt(v, 10))
    .filter((v) => !isNaN(v))
    .forEach((key: ViewerType) => {
      _c.viewers[key] = _c.creators[key](scene);
      parent(_c, key, scene).append(_c.viewers[key]);
    });
  scorer.register(() => _c.fire(ViewerEvent.SCORED));
  initController(
    _c.viewers[ViewerType.BUILDER].width,
    _c.viewers[ViewerType.BUILDER].height
  );
};

const handleBuilt = (_c: Controller) => {
  _c.viewers[ViewerType.BUILDER].hide();
};

/**
 * 得点が入り、ボーダーを超えたならばボーナスを発火する、
 * @param _c
 */
const handleScored = (_c: Controller) => {
  if (
    _c.borders.length > 0 &&
    scorer.get() >= _c.borders[0] &&
    !_c.isBonusing
  ) {
    _c.fire(ViewerEvent.BONUS_STARTED);
  }
};

const handleBonusStarted = (_c: Controller) => {
  _c.viewers[ViewerType.BONUS].show();
  _c.viewers[ViewerType.SHADOW].show();
  _c.borders.shift();
  _c.isBonusing = true;
};

const handleBranchStarted = (_c: Controller) => {
  _c.viewers[ViewerType.BONUS].hide();
  _c.viewers[ViewerType.BRANCH_BUILDER].show();
};

const handleBranching = (_c: Controller) => {
  _c.viewers[ViewerType.SHADOW].hide();
};

const handleBranchEnded = (_c: Controller) => {
  _c.viewers[ViewerType.BRANCH_BUILDER].hide();
  _c.isBonusing = false;
};

const handleStationStarted = (_c: Controller) => {
  _c.viewers[ViewerType.BONUS].hide();
  _c.viewers[ViewerType.STATION_BUILDER].show();
};

const handleStationEnded = (_c: Controller) => {
  _c.viewers[ViewerType.STATION_BUILDER].hide();
  _c.viewers[ViewerType.SHADOW].hide();
  _c.isBonusing = false;
};

/**
 * イベントの発火をキャプチャできるようにする
 * @param _c
 */
const initListener = (_c: Controller, scene: g.Scene) => {
  const list: { key: ViewerEvent; value: (__c: Controller) => void }[] = [
    { key: ViewerEvent.INITED, value: (__c) => handleInited(__c, scene) },
    { key: ViewerEvent.BUILT, value: handleBuilt },
    { key: ViewerEvent.SCORED, value: handleScored },
    { key: ViewerEvent.BONUS_STARTED, value: handleBonusStarted },
    { key: ViewerEvent.BRANCH_STARTED, value: handleBranchStarted },
    { key: ViewerEvent.BRANCHING, value: handleBranching },
    { key: ViewerEvent.BRANCHED, value: handleBranchEnded },
    { key: ViewerEvent.STATION_STARTED, value: handleStationStarted },
    { key: ViewerEvent.STATION_ENDED, value: handleStationEnded },
  ];
  list.forEach((entry) => {
    _c._trackers[entry.key] = new Tracker(_c);
    _c._trackers[entry.key].register(entry.value);
    _c._listener.find(entry.key).track(_c._trackers[entry.key]);
  });
};

const viewer: Controller = {
  isBonusing: false,
  borders: [...BORDERS],
  creators: {},
  viewers: {},
  _listener: new TriggerContainer<ViewerEvent, Controller>(),
  _trackers: {},

  put: (key: ViewerType, creator: ViewerCreator) => {
    viewer.creators[key] = creator;
  },

  init: (loadedScene: g.Scene) => {
    initListener(viewer, loadedScene);

    viewer.fire(ViewerEvent.INITED);
  },

  register: (ev: ViewerEvent, listener: (_c: Controller) => void) => {
    viewer._trackers[ev].register(listener);
  },

  fire: (ev: ViewerEvent) => {
    viewer._listener.fire(ev, viewer);
  },

  reset: () => {
    viewer.isBonusing = false;
    viewer.borders = [...BORDERS];
    viewer.creators = {};
    viewer.viewers = {};
    viewer._trackers = {};
    viewer._listener.flush();
    viewer._listener.unregisterAll();
  },
};

export default viewer;
