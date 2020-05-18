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
  border: number
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
