import { TriggerContainer } from "../models/listener";
import userResource from "../models/user_resource";
import { createSquareSprite } from "./sprite";

enum GuideEvent {
  STARTED,
  TOUCH_STARTED,
  TOUCH_ENDED,
  ENDED,
}

type GuideState = { isActive: boolean };

/**
 * 画面に占める路線敷設ガイドの大きさ
 */
const SIZE = 0.8;

const activeOpacity = 0.5;
const inactiveOpacity = 0.5;

const tapDelaySec = 1;
const tapDistance = 50;
const tapStart = { x: 100, y: 100 };
const tapEnd = { x: 400, y: 300 };
const moveDelaySec = 2;

/**
 * 全体を乗せるコンテナを作成
 * @param loadedScene
 */
const createPanel = (loadedScene: g.Scene) =>
  new g.E({
    scene: loadedScene,
    x: (g.game.width * (1 - SIZE)) / 2,
    y: (g.game.height * (1 - SIZE)) / 2,
    width: g.game.width * SIZE,
    height: g.game.height * SIZE,
  });

/**
 * ガイド文を作成し、追加します
 * @param panel
 */
const appendInstraction = (panel: g.E) => {
  const sprite = createSquareSprite(panel.scene, "build_txt");
  sprite.x = (panel.width - sprite.width) / 2;
  sprite.y = 40;
  sprite.modified();
  panel.append(sprite);
};

const handleTouchStart = (
  panel: g.E,
  state: GuideState,
  listener: TriggerContainer<GuideEvent, GuideState>
) => {
  if (!state.isActive) {
    return;
  }
  const sprite = createSquareSprite(panel.scene, "finger_basic");
  sprite.opacity = 0;
  sprite.x = tapStart.x + tapDistance;
  sprite.y = tapStart.y;
  sprite.modified();
  let counter = 0;
  const animation = () => {
    if (counter < tapDelaySec * g.game.fps) {
      sprite.x -= tapDistance / tapDelaySec / g.game.fps;
      sprite.opacity += 1 / tapDelaySec / g.game.fps;
      sprite.modified();
    } else {
      panel.scene.update.remove(animation);
      panel.remove(sprite);
      listener.add(GuideEvent.TOUCH_STARTED, state);
      listener.fire(GuideEvent.TOUCH_STARTED);
    }
    counter++;
  };
  panel.scene.update.add(animation);
  panel.append(sprite);
};

const handleTouchMove = (
  panel: g.E,
  state: GuideState,
  listener: TriggerContainer<GuideEvent, GuideState>
) => {
  if (!state.isActive) {
    return;
  }
  const sprite = createSquareSprite(panel.scene, "finger_touch_basic");
  sprite.x = tapStart.x;
  sprite.y = tapStart.y;
  sprite.modified();

  const dx = tapEnd.x - tapStart.x;
  const dy = tapEnd.y - tapStart.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const arrow = new g.FilledRect({
    x: (tapStart.x + tapEnd.x) / 2,
    y: (tapStart.y + tapEnd.y) / 2,
    scene: panel.scene,
    width: dist,
    height: 50,
    cssColor: "#aa5533",
    angle:
      (Math.atan2(tapEnd.y - tapStart.y, tapEnd.x - tapStart.x) * 180) /
      Math.PI,
    anchorX: 0.5,
    anchorY: 0.5,
  });

  const pane = new g.Pane({
    scene: panel.scene,
    x: panel.x + tapStart.x,
    y: panel.y + tapStart.y / 2,
    width: 90,
    height: (tapEnd.y - tapStart.y) * 2,
  });
  pane.append(arrow);

  let counter = 0;
  const animation = () => {
    if (counter < moveDelaySec * g.game.fps) {
      const d = counter / moveDelaySec / g.game.fps;
      sprite.x = tapStart.x * (1 - d) + tapEnd.x * d;
      sprite.y = tapStart.y * (1 - d) + tapEnd.y * d;
      sprite.modified();
      pane.width = (tapEnd.x - tapStart.x) * d + 90;
      pane.invalidate();
    } else {
      panel.scene.update.remove(animation);
      panel.remove(sprite);
      panel.remove(pane);
      listener.add(GuideEvent.TOUCH_ENDED, state);
      listener.fire(GuideEvent.TOUCH_ENDED);
    }
    counter++;
  };
  panel.scene.update.add(animation);
  panel.append(pane);
  panel.append(sprite);
};

const handleTouchEnd = (
  panel: g.E,
  state: GuideState,
  listener: TriggerContainer<GuideEvent, GuideState>
) => {
  if (!state.isActive) {
    return;
  }
  const sprite = createSquareSprite(panel.scene, "finger_basic");
  sprite.opacity = 0;
  sprite.x = tapEnd.x;
  sprite.y = tapEnd.y;
  sprite.opacity = 1;
  sprite.modified();
  let counter = 0;
  const animation = () => {
    if (counter < tapDelaySec * g.game.fps) {
      sprite.x += tapDistance / tapDelaySec / g.game.fps;
      sprite.opacity -= 1 / tapDelaySec / g.game.fps;
      sprite.modified();
    } else {
      panel.scene.update.remove(animation);
      panel.remove(sprite);
      listener.add(GuideEvent.STARTED, state);
      listener.fire(GuideEvent.STARTED);
    }
    counter++;
  };
  panel.scene.update.add(animation);
  panel.append(sprite);
};

/**
 * モデル操作によって、ガイドの表示有無を変化させる
 * @param panel
 */
const _createHandler = (panel: g.E, state: GuideState) => ({
  onStarted: () => {
    // カーソルを押下したならガイドを薄くする
    panel.opacity = inactiveOpacity;
    panel.modified();
  },
  onFixed: () => {
    // カーソルが離れ、路線が完成したなら、ガイドを消す
    state.isActive = false;
    panel.hide();
  },
});

/**
 * 路線建設ガイドを表示。タッチイベントをキャプチャすると路線建設できないので、
 * モデルリスナー経由で表示を変化させる
 * @param loadedScene
 */
const createRailBuildGuide = (loadedScene: g.Scene) => {
  const panel = createPanel(loadedScene);
  // ガイド文
  appendInstraction(panel);

  const guide = new g.E({ scene: loadedScene, opacity: activeOpacity });
  panel.append(guide);

  const state: GuideState = { isActive: true };

  // ガイドアニメーション
  const listener = new TriggerContainer<GuideEvent, GuideState>();

  listener.find(GuideEvent.STARTED).register((s) => {
    handleTouchStart(guide, s, listener);
  });
  listener.find(GuideEvent.TOUCH_STARTED).register((s) => {
    handleTouchMove(guide, s, listener);
  });
  listener.find(GuideEvent.TOUCH_ENDED).register((s) => {
    handleTouchEnd(guide, s, listener);
  });
  listener.add(GuideEvent.STARTED, state);
  listener.fire(GuideEvent.STARTED);

  userResource.stateListeners.push(_createHandler(panel, state));
  return panel;
};

export default createRailBuildGuide;
