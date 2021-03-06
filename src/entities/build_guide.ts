import { TriggerContainer } from "../models/listener";
import userResource from "../models/user_resource";
import { appendInstruction, createWorkingArea } from "./rectangle";
import { createSquareSprite } from "./sprite";

enum GuideEvent {
  STARTED,
  TOUCH_STARTED,
  TOUCH_ENDED,
  ENDED,
}

type GuideState = {};

const activeOpacity = 0.5;
const inactiveOpacity = 0.5;

const tapDelaySec = 1;
const tapDistance = 50;
const tapStart = { x: 100, y: 150 };
const tapEnd = { x: 400, y: 300 };
const moveDelaySec = 2;

const addShiftAnimation = (
  isStart: boolean,
  panel: g.E,
  sprite: g.E,
  listener: TriggerContainer<GuideEvent, GuideState>
) => {
  let counter = 0;
  const animation = () => {
    if (counter < tapDelaySec * g.game.fps) {
      sprite.x +=
        ((isStart ? -1 : +1) * tapDistance) / tapDelaySec / g.game.fps;
      sprite.opacity += (isStart ? +1 : -1) / tapDelaySec / g.game.fps;
      sprite.modified();
    } else {
      panel.update.remove(animation);
      panel.remove(sprite);
      if (isStart) {
        listener.add(GuideEvent.TOUCH_STARTED, {});
        listener.fire(GuideEvent.TOUCH_STARTED);
      } else {
        listener.add(GuideEvent.STARTED, {});
        listener.fire(GuideEvent.STARTED);
      }
    }
    counter++;
  };
  panel.update.add(animation);
};

const handleTouchStart = (
  panel: g.E,
  listener: TriggerContainer<GuideEvent, GuideState>
) => {
  if (!(panel.parent as g.E).visible()) {
    return;
  }
  const sprite = createSquareSprite(panel.scene, "finger_basic");
  sprite.opacity = 0;
  sprite.x = tapStart.x + tapDistance;
  sprite.y = tapStart.y;
  sprite.modified();
  addShiftAnimation(true, panel, sprite, listener);
  panel.append(sprite);
};

const handleTouchMove = (
  panel: g.E,
  listener: TriggerContainer<GuideEvent, GuideState>
) => {
  if (!(panel.parent as g.E).visible()) {
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
    y: (tapStart.y + tapEnd.y) / 2 - 25,
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
      panel.update.remove(animation);
      panel.remove(sprite);
      panel.remove(pane);
      listener.add(GuideEvent.TOUCH_ENDED, {});
      listener.fire(GuideEvent.TOUCH_ENDED);
    }
    counter++;
  };
  panel.update.add(animation);
  panel.append(pane);
  panel.append(sprite);
};

const handleTouchEnd = (
  panel: g.E,
  listener: TriggerContainer<GuideEvent, GuideState>
) => {
  if (!(panel.parent as g.E).visible()) {
    return;
  }
  const sprite = createSquareSprite(panel.scene, "finger_basic");
  sprite.opacity = 0;
  sprite.x = tapEnd.x;
  sprite.y = tapEnd.y;
  sprite.opacity = 1;
  sprite.modified();
  addShiftAnimation(false, panel, sprite, listener);
  panel.append(sprite);
};

/**
 * モデル操作によって、ガイドの表示有無を変化させる
 * @param panel
 */
const _createHandler = (panel: g.E) => ({
  onStarted: () => {
    // カーソルを押下したならガイドを薄くする
    panel.opacity = inactiveOpacity;
    panel.modified();
  },
  onFixed: () => {
    // カーソルが離れたならば元の色合いに戻す。消すのは BUILTイベント発生後
    panel.opacity = activeOpacity;
    panel.modified();
  },
});

/**
 * 路線建設ガイドを表示。タッチイベントをキャプチャすると路線建設できないので、
 * モデルリスナー経由で表示を変化させる
 * @param loadedScene
 */
const createRailBuildGuide = (loadedScene: g.Scene) => {
  const panel = createWorkingArea(loadedScene, {});
  // ガイド文
  appendInstruction(panel, "build_txt");

  const guide = new g.E({ scene: loadedScene, opacity: activeOpacity });
  panel.append(guide);

  // ガイドアニメーション
  const listener = new TriggerContainer<GuideEvent, GuideState>();

  listener.find(GuideEvent.STARTED).register((s) => {
    handleTouchStart(guide, listener);
  });
  listener.find(GuideEvent.TOUCH_STARTED).register((s) => {
    handleTouchMove(guide, listener);
  });
  listener.find(GuideEvent.TOUCH_ENDED).register((s) => {
    handleTouchEnd(guide, listener);
  });
  listener.add(GuideEvent.STARTED, {});
  listener.fire(GuideEvent.STARTED);

  userResource.stateListeners.push(_createHandler(panel));
  return panel;
};

export default createRailBuildGuide;
