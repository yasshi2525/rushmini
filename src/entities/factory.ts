import { Pointable } from "../models/pointable";
import { insertTop } from "../utils/common";
import { ViewCreator } from "./creator";

/**
 * Modelの描画情報を含んだオブジェクト
 */
export type ViewObject<T> = {
  readonly subject: T;
  readonly viewer: g.E;
};

/**
 * モデルとビューアが紐付いたViewObjectを作成します
 */
class ViewObjectFactory<T extends Pointable> {
  protected readonly panel: g.E;
  protected readonly creator: ViewCreator<T>;
  public readonly children: ViewObject<T>[];
  protected readonly desc: boolean;

  /**
   * ファクトリーを作ります
   * @param panel 描画物を配置するエンティティ
   * @param creator モデルから描画物を作成する関数
   * @param desc 古い物ほど上に表示する場合 true
   */
  constructor(panel: g.E, creator: ViewCreator<T>, desc: boolean = false) {
    this.panel = panel;
    this.creator = creator;
    this.children = [];
    this.desc = desc;
  }

  /**
   * 引数に指定したモデルに対応する描画物を作成し、パネルに配置します
   * @param subject
   */
  public createInstance(subject: T) {
    const viewer = this.creator(this.panel.scene, subject);
    const obj: ViewObject<T> = { subject, viewer };

    if (this.desc) {
      insertTop(viewer, this.panel);
    } else {
      this.panel.append(viewer);
    }
    this.children.push(obj);
    return obj;
  }

  /**
   * 引数に指定したモデルに対応する描画物を削除します
   * @param subject
   */
  public removeInstance(subject: T) {
    const index = this.children.findIndex((v) => v.subject === subject);
    if (index !== -1) {
      const object = this.children[index];
      this.panel.remove(object.viewer);
      this.children.splice(index, 1);
    }
  }
}

export default ViewObjectFactory;
