import Vector from "../models/vector";

/**
 * Vectorを実装しているモデルの座標に描画するパネルを作成します
 * @param loadedScene
 * @param p
 * @param width
 * @param height
 */
const createPointableView = (
  loadedScene: g.Scene,
  p: Vector,
  width: number,
  height: number
) =>
  new g.E({
    scene: loadedScene,
    x: p.x - width / 2,
    y: p.y - height / 2,
    width,
    height,
  });

export default createPointableView;
