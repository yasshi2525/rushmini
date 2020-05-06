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
  });
  return sprite;
};
