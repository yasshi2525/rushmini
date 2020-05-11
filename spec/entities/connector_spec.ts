import connect from "entities/connector";
import ViewObjectFactory from "entities/factory";
import modelListener, { EventType } from "models/listener";
import { ZeroPoint } from "models/point";
import { Pointable } from "models/pointable";

import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => Promise<void>;
class Simple implements Pointable {
  loc() {
    return ZeroPoint;
  }
}

afterAll(() => {
  modelListener.flush();
});

describe("connetor", () => {
  let scene: g.Scene;
  let panel: g.E;
  let factory: ViewObjectFactory<Simple>;

  beforeEach(async () => {
    scene = await createLoadedScene();
    panel = new g.E({ scene });
    factory = new ViewObjectFactory(
      panel,
      (_scene, _) => new g.E({ scene: _scene })
    );
  });

  afterEach(async () => {
    await recreateGame();
  });

  it("viewer object is created after onDone event", () => {
    const subject = new Simple();
    connect(factory, Simple);
    modelListener.add(EventType.CREATED, subject);
    expect(panel.children).toBeUndefined();
    modelListener.fire(EventType.CREATED);
    expect(panel.children.length).toEqual(1);
  });

  it("viewer object is removed after onDelete event", () => {
    const subject = new Simple();
    connect(factory, Simple);
    modelListener.add(EventType.CREATED, subject);
    modelListener.fire(EventType.CREATED);
    expect(panel.children.length).toEqual(1);
    modelListener.add(EventType.DELETED, subject);
    modelListener.fire(EventType.DELETED);
    expect(panel.children.length).toEqual(0);
  });

  it("connect with modifier", () => {
    let counter = 0;
    const subject = new Simple();
    connect(factory, Simple, () => counter++);
    modelListener.add(EventType.CREATED, subject);
    modelListener.fire(EventType.CREATED);
    expect(counter).toEqual(0);
    modelListener.add(EventType.MODIFIED, subject);
    modelListener.fire(EventType.MODIFIED);
    expect(counter).toEqual(1);
  });
});
