import { createLoadedScene } from "../_helper/scene";
import ViewObjectFactory, { ViewerCreator } from "entities/factory";

declare const recreateGame: () => void;
class Simple {}

describe("factory", () => {
  let loadedScene: g.Scene;
  let panel: g.E;
  let creator: ViewerCreator<Simple>;
  let factory: ViewObjectFactory<Simple>;

  beforeEach(async () => {
    loadedScene = await createLoadedScene(g.game);
    panel = new g.E({ scene: loadedScene });
    creator = (scene, _) => new g.E({ scene });
    factory = new ViewObjectFactory(loadedScene, panel, creator);
  });

  afterEach(() => {
    recreateGame();
  });

  it("createInstance adds entity to panel", () => {
    const subject = new Simple();
    const object = factory.createInstance(subject);
    expect(object.subject).toEqual(subject);
    expect(panel.children.length).toEqual(1);
    expect(panel.children[0]).toEqual(object.viewer);
  });

  it("removeSubject removes registered object", () => {
    const subject = new Simple();
    const object = factory.createInstance(subject);
    factory.removeInstance(subject);
    expect(panel.children.length).toEqual(0);
  });

  it("removeSubject remains un-related object", () => {
    const s1 = new Simple();
    const s2 = new Simple();
    const o2 = factory.createInstance(s2);
    factory.removeInstance(s1);
    expect(panel.children.length).toEqual(1);
    expect(panel.children[0]).toEqual(o2.viewer);
  });
});
