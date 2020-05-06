import userResource from "../models/user_resource";
import viewer, { ViewerType } from "../utils/viewer";

/**
 * 画面に占める路線敷設ガイドの大きさ
 */
const scale = 0.8;

const activeOpacity = 0.75;
const inactiveOpacity = 0.25;

const fontSize = 20;

/**
 * ガイドオブジェクトとガイド全体の余白
 */
const padding = 120;
/**
 * 開始点・終了点の大きさ
 */
const cursorSize = 30;

const arrowHeight = 30;
const arrowWidth = 300;
const arrowAngle = 30;

/**
 * 全体を乗せるコンテナを作成
 * @param loadedScene
 */
const _createPanel = (loadedScene: g.Scene) =>
  new g.E({
    scene: loadedScene,
    x: (g.game.width * (1 - scale)) / 2,
    y: (g.game.height * (1 - scale)) / 2,
    width: g.game.width * scale,
    height: g.game.height * scale,
    opacity: activeOpacity,
  });

/**
 * ガイド文を作成し、追加します
 * @param parent
 */
const _appendInstraction = (parent: g.E) =>
  parent.append(
    new g.SystemLabel({
      scene: parent.scene,
      text: "路線をドラッグ＆ドロップorスワイプで敷こう",
      fontSize,
      x: parent.width / 2,
      y: fontSize * 2,
      textAlign: g.TextAlign.Center,
    })
  );

/**
 * 敷設開始・終了の地点を指すブロックを作成します
 * @param parent
 * @param x
 * @param y
 */
const _appendBlock = (parent: g.E, x: number, y: number) =>
  parent.append(
    new g.FilledRect({
      scene: parent.scene,
      x,
      y,
      width: cursorSize,
      height: cursorSize,
      cssColor: "#aa5533",
    })
  );

const _appendArrow = (parent: g.E) =>
  parent.append(
    new g.FilledRect({
      scene: parent.scene,
      x: (g.game.width - arrowWidth - padding) / 2,
      y: parent.height / 2,
      width: arrowWidth,
      height: arrowHeight,
      cssColor: "#aa5533",
      angle: arrowAngle,
      anchorY: 0.5,
    })
  );

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
    // カーソルが離れ、路線が完成したなら、ガイドを消す
    panel.hide();
  },
  onReset: () => {
    panel.show();
  },
});

/**
 * 路線建設ガイドを表示。タッチイベントをキャプチャすると路線建設できないので、
 * モデルリスナー経由で表示を変化させる
 * @param loadedScene
 */
const createRailBuildGuide = (loadedScene: g.Scene) => {
  const panel = _createPanel(loadedScene);

  // ガイド文
  _appendInstraction(panel);

  // 敷設開始点・終了点
  _appendBlock(panel, padding, padding);
  _appendBlock(
    panel,
    panel.width - padding - cursorSize,
    panel.height - padding - cursorSize
  );

  // 矢印
  _appendArrow(panel);

  userResource.stateListeners.push(_createHandler(panel));
  return panel;
};

export default createRailBuildGuide;
