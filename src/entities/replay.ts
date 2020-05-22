import cityResource from "../models/city_resource";
import modelListener from "../models/listener";
import userResource from "../models/user_resource";
import routeFinder from "../utils/route_finder";
import scenes, { SceneType } from "../utils/scene";
import scorer from "../utils/scorer";
import statics from "../utils/statics";
import stepper from "../utils/stepper";
import ticker from "../utils/ticker";
import transportFinder from "../utils/transport_finder";
import tweet from "../utils/tweet";
import viewer from "../utils/viewer";
import { createSquareSprite } from "./sprite";

const scale = 0.85;
const width = 250;
const height = 75;

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
  statics.reset();
  tweet.reset();
  modelListener.unregisterAll();
  modelListener.flush();
  ticker.reset();
  scorer.reset();
  scorer.init(g.game.vars.gameState);
  tweet.init(true); // リプレイできる = アツマール環境
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
  const btn = createSquareSprite(parent.scene, "replay_txt");
  btn.x = (parent.width - btn.width) / 2;
  btn.y = (parent.height - btn.height) / 2;
  btn.modified();
  parent.append(btn);
};

const createReplay = (loadedScene: g.Scene) => {
  const panel = _createPanel(loadedScene);
  _appendBackground(panel);
  _appendButton(panel);
  // パネルを押下したとき半透明にする
  panel.pointDown.add(() => {
    panel.opacity = inactiveOpacity;
    panel.modified();
  });
  panel.pointUp.add(() => {
    panel.opacity = activeOpacity;
    panel.modified();
    replay();
  });
  return panel;
};

export default createReplay;
