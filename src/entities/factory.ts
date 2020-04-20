/**
 * Modelの描画情報を含んだオブジェクト
 */
type ViewObject<T> = {
  readonly subject: T;
  readonly viewer: g.E;
};

export type ViewerCreator<T> = (loadedScene: g.Scene, subject: T) => g.E;

/**
 * モデルとビューアが紐付いたViewObjectを作成します
 */
class ViewObjectFactory<T> {
  private readonly loadedScene: g.Scene;
  private readonly panel: g.E;
  private readonly creator: ViewerCreator<T>;
  private readonly children: ViewObject<T>[];

  /**
   * ファクトリーを作ります
   * @param loadedScene シーン
   * @param panel 描画物を配置するエンティティ
   * @param creator モデルから描画物を作成する関数
   */
  constructor(loadedScene: g.Scene, panel: g.E, creator: ViewerCreator<T>) {
    this.loadedScene = loadedScene;
    this.panel = panel;
    this.creator = creator;
    this.children = [];
  }

  /**
   * 引数に指定したモデルに対応する描画物を作成し、パネルに配置します
   * @param subject
   */
  public createInstance(subject: T) {
    const viewer = this.creator(this.loadedScene, subject);
    const obj: ViewObject<T> = { subject, viewer };
    this.panel.append(viewer);
    this.children.push(obj);
    return obj;
  }

  /**
   * 引数に指定したモデルに対応する描画物を削除します
   * @param subject
   */
  public removeSubject(subject: T) {
    const index = this.children.findIndex((v) => v.subject === subject);
    if (index !== -1) {
      const object = this.children[index];
      this.panel.remove(object.viewer);
      this.children.splice(index, 1);
    }
  }
}

export default ViewObjectFactory;
