import userResource from "../models/user_resource";

/**
 * 画面に占める路線敷設ガイドの大きさ
 */
const scale = 0.9;

const activeOpacity = 0.75;
const inactiveOpacity = 0.25;

const fontSize = 20;

/**
 * ガイドオブジェクトとガイド全体の余白
 */
const padding = 20;
/**
 * 開始点・終了点の大きさ
 */
const cursorSize = 30;

const arrowHeight = 30;
const arrowWidth = 450;
const arrowAngle = 20;

/**
 * 路線建設ガイドを表示。タッチイベントをキャプチャすると路線建設できないので、
 * モデルリスナー経由で表示を変化させる
 * @param loadedScene
 */
const createRailBuildGuide = (loadedScene: g.Scene) => {
  const panel = new g.E({
    scene: loadedScene,
    x: (g.game.width * (1 - scale)) / 2,
    y: (g.game.height * (1 - scale)) / 2,
    width: g.game.width * scale,
    height: g.game.height * scale,
    opacity: activeOpacity,
  });

  // ガイド文
  panel.append(
    new g.SystemLabel({
      scene: loadedScene,
      text: "路線をマウスorタッチで敷こう",
      fontSize,
      x: panel.width / 2,
      y: padding,
      textAlign: g.TextAlign.Center,
    })
  );

  // 敷設開始点
  panel.append(
    new g.FilledRect({
      scene: loadedScene,
      x: padding,
      y: padding,
      width: cursorSize,
      height: cursorSize,
      cssColor: "#aa5533",
    })
  );

  // 敷設終了点
  panel.append(
    new g.FilledRect({
      scene: loadedScene,
      x: panel.width - padding - cursorSize,
      y: panel.height - padding - cursorSize,
      width: cursorSize,
      height: cursorSize,
      cssColor: "#aa5533",
    })
  );

  // 矢印
  panel.append(
    new g.FilledRect({
      scene: loadedScene,
      x: padding + cursorSize + padding,
      y: panel.height / 2,
      width: arrowWidth,
      height: arrowHeight,
      cssColor: "#aa5533",
      angle: arrowAngle,
    })
  );

  userResource.stateListeners.push({
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
  return panel;
};

export default createRailBuildGuide;
