import { createSquareSprite } from "./sprite";

const borderColor = "#000000";

/**
 * 画面に占める作業領域の大きさ
 */
const SIZE = 0.8;

const INSTRUCTION_Y = 120;
const WARNING_Y = 160;

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

export type Option = {
  touchable?: boolean;
  isPane?: boolean;
};

export const createWorkingArea = (scene: g.Scene, opts: Option) => {
  const entityOpt = {
    scene,
    x: (g.game.width * (1 - SIZE)) / 2,
    y: (g.game.height * (1 - SIZE)) / 2,
    width: g.game.width * SIZE,
    height: g.game.height * SIZE,
    touchable: opts.touchable ?? false,
  };
  return opts.isPane ? new g.Pane(entityOpt) : new g.E(entityOpt);
};

const appendSprite = (parent: g.E, src: string, y: number) => {
  const sprite = createSquareSprite(parent.scene, src);
  sprite.x = (parent.width - sprite.width) / 2;
  sprite.y = y;
  sprite.modified();
  parent.append(sprite);
  return sprite;
};

/**
 * ガイド文を作成し、追加します
 * @param parent
 * @param src
 */
export const appendInstruction = (parent: g.E, src: string) =>
  appendSprite(parent, src, INSTRUCTION_Y);

export const appnedWarning = (parent: g.E) => {
  const sprite = appendSprite(parent, "rollback_txt", WARNING_Y);
  sprite.hide();
  return sprite;
};

const setFullPos = (sprite: g.E, parent: g.E, toggle: boolean) => {
  sprite.x = parent.width - (toggle ? sprite.width / 2 : 0) - sprite.width / 2;
  sprite.y = toggle ? -sprite.height / 2 : 0;
  sprite.modified();
};

export const animateFull = (parent: g.E, shouldEnd: () => boolean) => {
  if (parent.update.length > 0) return;
  let cnt = 0;
  const sp = createSquareSprite(parent.scene, "full_basic");
  setFullPos(sp, parent, false);
  const anim = () => {
    if (shouldEnd()) {
      parent.update.remove(anim);
      sp.destroy();
      return;
    }
    setFullPos(sp, parent, cnt % g.game.fps > g.game.fps / 2);
    cnt++;
  };
  parent.append(sp);
  parent.update.add(anim);
};
