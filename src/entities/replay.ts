/**
 * 画面全体に占める割合
 */
const scale = 0.9;
const fontSize = 50;

const activeOpacity = 1.0;
const inactiveOpacity = 0.5;

const _createPanel = (loadedScene: g.Scene) =>
  new g.E({
    scene: loadedScene,
    x: (g.game.width * (1 - scale)) / 2,
    y: (g.game.height * (1 - scale)) / 2,
    width: g.game.width * scale,
    height: g.game.height * scale,
    opacity: activeOpacity,
  });

const _appendBackground = (parent: g.E) =>
  parent.append(
    new g.FilledRect({
      scene: parent.scene,
      x: 0,
      y: 0,
      width: parent.width,
      height: parent.height,
      cssColor: "#ffffff",
    })
  );

const _appendButton = (parent: g.E) => {
  const btn = new g.SystemLabel({
    scene: parent.scene,
    x: parent.width / 2,
    y: parent.height / 2,
    fontSize,
    textAlign: g.TextAlign.Center,
    text: "Replay",
  });
  // パネルを押下したとき半透明にする
  parent.pointDown.add(() => {
    parent.opacity = inactiveOpacity;
    parent.modified();
  });
  parent.pointUp.add(() => {
    parent.opacity = activeOpacity;
    parent.modified();
  });
};

const createReplay = (loadedScene: g.Scene) => {
  const panel = _createPanel(loadedScene);
  _appendBackground(panel);
  _appendButton(panel);
  return panel;
};

export default createReplay;
