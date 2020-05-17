import { ViewCreator } from "entities/creator";
import ViewObjectFactory from "entities/factory";
import { ZeroPoint } from "models/point";
import { Pointable } from "models/pointable";

import { createLoadedScene } from "../_helper/scene";

class Simple implements Pointable {
  loc() {
    return ZeroPoint;
  }
}

describe("factory", () => {
  let oldWarn: (msg: string) => void;
  let loadedScene: g.Scene;
  let panel: g.E;
  let creator: ViewCreator<Simple>;
  let factory: ViewObjectFactory<Simple>;

  beforeEach(async () => {
    oldWarn = console.warn;
    loadedScene = await createLoadedScene();
    panel = new g.E({ scene: loadedScene });
    creator = (scene, _) => new g.E({ scene });
    factory = new ViewObjectFactory(panel, creator);
  });

  afterEach(async () => {
    console.warn = oldWarn;
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
    console.warn = jest.fn();
    const s1 = new Simple();
    const s2 = new Simple();
    const o2 = factory.createInstance(s2);
    factory.removeInstance(s1);
    expect(panel.children.length).toEqual(1);
    expect(panel.children[0]).toEqual(o2.viewer);
    expect(console.warn).toHaveBeenCalled();
  });
});
