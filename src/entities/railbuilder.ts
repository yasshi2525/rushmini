import userResource, { ModelStateType } from "../models/user_resource";

const startHandler = (x: number, y: number) => {
  if (userResource.getState() === ModelStateType.INITED) {
    userResource.start(x, y);
  }
};

const moveHandler = (x: number, y: number) => {
  if (userResource.getState() === ModelStateType.STARTED) {
    userResource.extend(x, y);
  }
};

const endHandler = () => {
  if (userResource.getState() === ModelStateType.STARTED) {
    userResource.end();
  }
};

/**
 * カーソルの動きに沿って路線を作成します
 * @param loadedScene
 */
const createSensor = (loadedScene: g.Scene) => {
  const sensor = new g.E({
    scene: loadedScene,
    x: 0,
    y: 0,
    width: g.game.width,
    height: g.game.height,
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
  sensor.pointUp.add(() => endHandler());

  return sensor;
};

const createRailBuilder = (loadedScene: g.Scene) => {
  const panel = new g.E({ scene: loadedScene });
  panel.append(createSensor(loadedScene));
  return panel;
};

export default createRailBuilder;
