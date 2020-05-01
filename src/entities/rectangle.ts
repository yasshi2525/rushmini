const borderColor = "#000000";

/**
 * 中身 width, height 外枠 border はみ出す四角形を作成します
 * @param scene
 * @param width
 * @param height
 * @param color
 * @param border
 */
export const createFramedRect = (
  scene: g.Scene,
  width: number,
  height: number,
  color: string,
  border = 4
) => {
  const frame = new g.FilledRect({
    scene,
    width: width + border * 2,
    height: height + border * 2,
    cssColor: borderColor,
  });
  frame.append(
    new g.FilledRect({
      scene,
      x: border,
      y: border,
      width: width,
      height: height,
      cssColor: color,
    })
  );
  return frame;
};

/**
 * 余白のある四角形を返します
 * @param scene
 * @param padding
 * @param color
 * @param border
 */
export const createPaddingRect = (
  scene: g.Scene,
  padding: number,
  color: string,
  border: number = 0
) => {
  const rect = createFramedRect(
    scene,
    g.game.width - padding * 2,
    g.game.height - padding * 2,
    color,
    border
  );
  rect.x = padding - border;
  rect.y = padding - border;
  rect.modified();
  return rect;
};
