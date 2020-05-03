/**
 * 元画像の
 * @param scene
 * @param src
 * @param scale
 */
export const createSquareSprite = (
  scene: g.Scene,
  src: string,
  scale: number = 1
) => {
  const sprite = new g.Sprite({
    scene,
    src: scene.assets[src],
    scaleX: scale,
    scaleY: scale,
    anchorX: 0.5,
    anchorY: 0.5,
  });
  return sprite;
};
