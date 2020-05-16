import cityResource from "../models/city_resource";
import modelListener from "../models/listener";
import userResource from "../models/user_resource";
import routeFinder from "../utils/route_finder";
import scenes, { SceneType } from "../utils/scene";
import scorer from "../utils/scorer";
import stepper from "../utils/stepper";
import ticker from "../utils/ticker";
import transportFinder from "../utils/transport_finder";
import viewer from "../utils/viewer";

const scale = 0.8;
const width = 250;
const height = 75;
const fontSize = 35;

const activeOpacity = 1.0;
const inactiveOpacity = 0.5;

const replay = () => {
  scenes.reset();
  viewer.reset();
  transportFinder.reset();
  routeFinder.reset();
  stepper.reset();
  userResource.reset();
  cityResource.reset();
  modelListener.unregisterAll();
  modelListener.flush();
  ticker.reset();
  scorer.reset();
  scorer.init(g.game.vars.gameState);
  g.game.pushScene(scenes._scenes[SceneType.TITLE]);
};

const _createPanel = (loadedScene: g.Scene) =>
  new g.E({
    scene: loadedScene,
    x: g.game.width * scale - width,
    y: g.game.height * scale - height,
    width,
    height,
    opacity: activeOpacity,
    touchable: true,
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
    text: "もう一度あそぶ",
    textColor: "#000000",
  });
  // パネルを押下したとき半透明にする
  parent.pointDown.add(() => {
    parent.opacity = inactiveOpacity;
    parent.modified();
  });
  parent.pointUp.add(() => {
    parent.opacity = activeOpacity;
    parent.modified();
    replay();
  });
  parent.append(btn);
};

const createReplay = (loadedScene: g.Scene) => {
  const panel = _createPanel(loadedScene);
  _appendBackground(panel);
  _appendButton(panel);
  return panel;
};

export default createReplay;
