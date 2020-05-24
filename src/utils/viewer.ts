import creators from "../entities/creator";
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
import statics from "./statics";
import stepper from "./stepper";
import ticker, { EventType as TickEventType } from "./ticker";
import transportFinder from "./transport_finder";

/**
 * ビューアの役割と描画順
 */
export enum ViewerType {
  /**
   * モデルの描画先
   */
  MODEL,
  /**
   * 力尽きた人間の表示
   */
  DESPAWNER,
  /**
   * 人の動きによる得点授受
   */
  SCORER,
  /**
   * 鉄道建設の仕方の説明
   */
  BUILD_GUIDE,
  /**
   * 鉄道建設の入力受付
   */
  BUILDER,
  /**
   * 初回ボーナス授受まで表示するアナウンス
   */
  WAITER,
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
   * 住宅開発の入力受付
   */
  RESIDENCE_BUILDER,
  /**
   * 作業領域の枠
   */
  FRAME,
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
   * 電車増発ボーナスボタン
   */
  BONUS_TRAIN,
  /**
   * 宅地開発ボーナスボタン
   */
  BONUS_RESIDENCE,
  /**
   * 残り時間の表示
   */
  TICK,
  /**
   * 獲得点数の表示
   */
  SCORE,
  /**
   * ボーナス選択画面に戻るアイコンの表示
   */
  BONUS_UNDO,
  /**
   * ボーナスアイコンの表示
   */
  BONUS_BADGE,
  /**
   * ヘルプの表示
   */
  HELP,
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
   * 自動建造ボーナスが発火した
   */
  AUTOBUILD_BONUSED,
  /**
   * ボーナスが発火した (要:前のボーナスが終了)
   */
  USER_BONUS_STARTED,
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
   * 支線建設やりなおし
   */
  BRANCH_ROLLBACKED,
  /**
   * 支線建設キャンセル
   */
  BRANCH_CANCELED,
  /**
   * 新駅ボーナスが選ばれた（立地を探し中）
   */
  STATION_STARTED,
  /**
   * 新駅の建設完了
   */
  STATION_ENDED,
  /**
   * 新駅建設キャンセル
   */
  STATION_CANCELED,
  /**
   * 列車の増発完了
   */
  TRAIN_ENDED,
  /**
   * 宅地開発ボーナスが選ばれた（立地を探し中）
   */
  RESIDENCE_STARTED,
  /**
   * 住宅の建設完了
   */
  RESIDENCE_ENDED,
  /**
   * 住宅建設キャンセル
   */
  RESIDENCE_CANCELED,
  /**
   * ボーナス画面の最小化
   */
  BONUS_MINIMIZED,
  /**
   * ボーナス画面の再オープン
   */
  BONUS_REACTIVED,
  /**
   * ボーナス選択画面に戻る
   */
  BONUS_UNDONE,
}

/**
 * ボーナスが発火されるボーダー点
 */
const USER_BONUSES = [1000, 3000, 7000, 15000];

/**
 * 住宅自動増加ボーナスが発火されるボーダー点
 */
const AUTOBUILD_BONUSES = [500, 2000, 5000, 11000];

type ViewerCreator = (scene: g.Scene) => g.E;

type Controller = {
  isBonusing: boolean;
  userBonuses: number[];
  autoBldBonuses: number[];
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
    case ViewerType.BONUS_TRAIN:
    case ViewerType.BONUS_RESIDENCE:
      return _c.viewers[ViewerType.BONUS];
    default:
      return scene;
  }
};

const initController = (width: number, height: number) => {
  statics.init();
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
  _c.viewers[ViewerType.BUILD_GUIDE].hide();
  _c.viewers[ViewerType.BUILDER].hide();
  _c.viewers[ViewerType.WAITER].show();
};

/**
 * 得点が入り、ボーダーを超えたならばボーナスを発火する、
 * @param _c
 */
const handleScored = (_c: Controller) => {
  if (_c.autoBldBonuses.length > 0 && scorer.get() >= _c.autoBldBonuses[0]) {
    _c.fire(ViewerEvent.AUTOBUILD_BONUSED);
  }
  if (
    _c.userBonuses.length > 0 &&
    scorer.get() >= _c.userBonuses[0] &&
    !_c.isBonusing
  ) {
    _c.fire(ViewerEvent.USER_BONUS_STARTED);
  }
};

const handleAutoBuildBonus = (_c: Controller) => {
  cityResource.residence();
  _c.autoBldBonuses.shift();
};

const handleBonusStarted = (_c: Controller) => {
  _c.viewers[ViewerType.WAITER].hide();
  _c.viewers[ViewerType.BONUS].show();
  _c.viewers[ViewerType.SHADOW].show();
  _c.viewers[ViewerType.BONUS_BADGE].show();
  _c.userBonuses.shift();
  _c.isBonusing = true;
};

const handleBranchStarted = (_c: Controller) => {
  _c.viewers[ViewerType.BONUS].hide();
  _c.viewers[ViewerType.BONUS_BADGE].hide();
  _c.viewers[ViewerType.BRANCH_BUILDER].show();
  _c.viewers[ViewerType.BONUS_UNDO].show();
};

const handleBranching = (_c: Controller) => {
  _c.viewers[ViewerType.SHADOW].hide();
  _c.viewers[ViewerType.BONUS_UNDO].hide();
};

const handleBranchEnded = (_c: Controller) => {
  _c.viewers[ViewerType.BRANCH_BUILDER].hide();
  _c.viewers[ViewerType.BONUS_UNDO].hide();
  _c.isBonusing = false;
};

const handleBranchRollbacked = (_c: Controller) => {
  _c.viewers[ViewerType.SHADOW].show();
  _c.viewers[ViewerType.BONUS_UNDO].show();
};

const handleBranchCanceled = (_c: Controller) => {
  _c.viewers[ViewerType.BRANCH_BUILDER].hide();
  _c.viewers[ViewerType.BONUS_BRANCH].children[1].show();
};

const handleStationStarted = (_c: Controller) => {
  _c.viewers[ViewerType.BONUS].hide();
  _c.viewers[ViewerType.BONUS_BADGE].hide();
  _c.viewers[ViewerType.STATION_BUILDER].show();
  _c.viewers[ViewerType.BONUS_UNDO].show();
};

const handleStationEnded = (_c: Controller) => {
  _c.viewers[ViewerType.STATION_BUILDER].hide();
  _c.viewers[ViewerType.SHADOW].hide();
  _c.viewers[ViewerType.BONUS_UNDO].hide();
  _c.isBonusing = false;
};

const handleStationCanceled = (_c: Controller) => {
  _c.viewers[ViewerType.STATION_BUILDER].hide();
  _c.viewers[ViewerType.BONUS_STATION].children[1].show();
};

const handleTrainEnded = (_c: Controller) => {
  _c.viewers[ViewerType.SHADOW].hide();
  _c.viewers[ViewerType.BONUS].hide();
  _c.viewers[ViewerType.BONUS_BADGE].hide();
  _c.isBonusing = false;
};

const handleResidenceStarted = (_c: Controller) => {
  _c.viewers[ViewerType.BONUS].hide();
  _c.viewers[ViewerType.SHADOW].hide();
  _c.viewers[ViewerType.BONUS_BADGE].hide();
  _c.viewers[ViewerType.RESIDENCE_BUILDER].show();
  _c.viewers[ViewerType.BONUS_UNDO].show();
};

const handleResidenceEnded = (_c: Controller) => {
  _c.viewers[ViewerType.RESIDENCE_BUILDER].hide();
  _c.viewers[ViewerType.BONUS_UNDO].hide();
  _c.isBonusing = false;
};

const handleResidenceCanceled = (_c: Controller) => {
  _c.viewers[ViewerType.RESIDENCE_BUILDER].hide();
  _c.viewers[ViewerType.BONUS_RESIDENCE].children[1].show();
};

const handleBonusMinimized = (_c: Controller) => {
  _c.viewers[ViewerType.BONUS].hide();
  _c.viewers[ViewerType.SHADOW].hide();
};

const handleBonusReactived = (_c: Controller) => {
  _c.viewers[ViewerType.BONUS].show();
  _c.viewers[ViewerType.SHADOW].show();
};

const handleBonusUndone = (_c: Controller) => {
  if (_c.viewers[ViewerType.BRANCH_BUILDER].visible()) {
    _c.fire(ViewerEvent.BRANCH_CANCELED);
  } else if (_c.viewers[ViewerType.STATION_BUILDER].visible()) {
    _c.fire(ViewerEvent.STATION_CANCELED);
  } else if (_c.viewers[ViewerType.RESIDENCE_BUILDER].visible()) {
    _c.fire(ViewerEvent.RESIDENCE_CANCELED);
  }
  _c.viewers[ViewerType.SHADOW].show();
  _c.viewers[ViewerType.BONUS].show();
  _c.viewers[ViewerType.BONUS_BADGE].show();
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
    { key: ViewerEvent.AUTOBUILD_BONUSED, value: handleAutoBuildBonus },
    { key: ViewerEvent.USER_BONUS_STARTED, value: handleBonusStarted },
    { key: ViewerEvent.BRANCH_STARTED, value: handleBranchStarted },
    { key: ViewerEvent.BRANCHING, value: handleBranching },
    { key: ViewerEvent.BRANCHED, value: handleBranchEnded },
    { key: ViewerEvent.BRANCH_ROLLBACKED, value: handleBranchRollbacked },
    { key: ViewerEvent.BRANCH_CANCELED, value: handleBranchCanceled },
    { key: ViewerEvent.STATION_STARTED, value: handleStationStarted },
    { key: ViewerEvent.STATION_ENDED, value: handleStationEnded },
    { key: ViewerEvent.STATION_CANCELED, value: handleStationCanceled },
    { key: ViewerEvent.TRAIN_ENDED, value: handleTrainEnded },
    { key: ViewerEvent.RESIDENCE_STARTED, value: handleResidenceStarted },
    { key: ViewerEvent.RESIDENCE_ENDED, value: handleResidenceEnded },
    { key: ViewerEvent.RESIDENCE_CANCELED, value: handleResidenceCanceled },
    { key: ViewerEvent.BONUS_MINIMIZED, value: handleBonusMinimized },
    { key: ViewerEvent.BONUS_REACTIVED, value: handleBonusReactived },
    { key: ViewerEvent.BONUS_UNDONE, value: handleBonusUndone },
  ];
  list.forEach((entry) => {
    _c._trackers[entry.key] = new Tracker(_c);
    _c._trackers[entry.key].register(entry.value);
    _c._listener.find(entry.key).track(_c._trackers[entry.key]);
  });
};

const viewer: Controller = {
  isBonusing: false,
  userBonuses: [...USER_BONUSES],
  autoBldBonuses: [...AUTOBUILD_BONUSES],
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
    viewer.userBonuses = [...USER_BONUSES];
    viewer.autoBldBonuses = [...AUTOBUILD_BONUSES];
    viewer.creators = {};
    viewer.viewers = {};
    viewer._trackers = {};
    viewer._listener.flush();
    viewer._listener.unregisterAll();
  },
};

export default viewer;
