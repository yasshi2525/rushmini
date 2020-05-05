import userResource, { ModelState } from "../models/user_resource";

const SIZE = 0.8;

const startHandler = (x: number, y: number) => {
  if (userResource.getState() === ModelState.INITED) {
    userResource.start(x, y);
  }
};

const moveHandler = (x: number, y: number) => {
  if (userResource.getState() === ModelState.STARTED) {
    userResource.extend(x, y);
  }
};

const endHandler = () => {
  if (userResource.getState() === ModelState.STARTED) {
    userResource.end();
  }
};

/**
 * カーソルの動きに沿って路線を作成します
 * @param loadedScene
 */
const createBuilder = (loadedScene: g.Scene) => {
  const sensor = new g.E({
    scene: loadedScene,
    x: (g.game.width * (1 - SIZE)) / 2,
    y: (g.game.height * (1 - SIZE)) / 2,
    width: g.game.width * SIZE,
    height: g.game.height * SIZE,
    touchable: true,
  });

  // カーソルが押下されたならば、路線建設を開始する
  sensor.pointDown.add((ev) => {
    startHandler(ev.point.x, ev.point.y);
  });

  // カーソルの地点まで線路を延伸する
  sensor.pointMove.add((ev) => {
    moveHandler(ev.point.x + ev.startDelta.x, ev.point.y + ev.startDelta.y);
  });

  // カーソルの地点を終点とする
  sensor.pointUp.add(() => {
    endHandler();
    sensor.hide();
  });

  return sensor;
};

export default createBuilder;
