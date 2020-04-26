import ViewObjectFactory from "entities/factory";
import connect from "entities/connector";
import { createLoadedScene } from "../_helper/scene";
import modelListener, { EventType } from "models/listener";
import { Pointable } from "models/pointable";
import { ZeroPoint } from "models/point";

declare const recreateGame: () => void;
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
    scene = await createLoadedScene(g.game);
    panel = new g.E({ scene });
    factory = new ViewObjectFactory(
      panel,
      (_scene, _) => new g.E({ scene: _scene })
    );
  });

  afterEach(() => {
    recreateGame();
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
});
