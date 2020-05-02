import { Pointable } from "../models/pointable";

/**
 * Vectorを実装しているモデルの座標に描画するパネルを作成します
 * @param loadedScene
 * @param p
 * @param width
 * @param height
 */
const createPointableView = (
  scene: g.Scene,
  p: Pointable,
  width: number,
  height: number
) =>
  new g.E({
    scene,
    x: p.loc().x,
    y: p.loc().y,
    width,
    height,
  });

export default createPointableView;
