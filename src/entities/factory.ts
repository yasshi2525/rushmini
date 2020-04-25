/**
 * Modelの描画情報を含んだオブジェクト
 */
export type ViewObject<T> = {
  readonly subject: T;
  readonly viewer: g.E;
};

export type ViewerCreator<T> = (loadedScene: g.Scene, subject: T) => g.E;

/**
 * モデルとビューアが紐付いたViewObjectを作成します
 */
class ViewObjectFactory<T> {
  private readonly panel: g.E;
  private readonly creator: ViewerCreator<T>;
  private readonly children: ViewObject<T>[];

  /**
   * ファクトリーを作ります
   * @param panel 描画物を配置するエンティティ
   * @param creator モデルから描画物を作成する関数
   */
  constructor(panel: g.E, creator: ViewerCreator<T>) {
    this.panel = panel;
    this.creator = creator;
    this.children = [];
  }

  /**
   * 引数に指定したモデルに対応する描画物を作成し、パネルに配置します
   * @param subject
   */
  public createInstance(subject: T) {
    const viewer = this.creator(this.panel.scene, subject);
    const obj: ViewObject<T> = { subject, viewer };
    this.panel.append(viewer);
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
    } else {
      console.warn("subject was not found in array");
    }
  }
}

export default ViewObjectFactory;
