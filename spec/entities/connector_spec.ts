import ViewObjectFactory from "entities/factory";
import { ListenerContainer } from "models/listener";
import connect from "entities/connector";
import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => void;
class Simple {}

describe("connetor", () => {
  let scene: g.Scene;
  let panel: g.E;
  let factory: ViewObjectFactory<Simple>;
  let listener: ListenerContainer<Simple>;

  beforeEach(async () => {
    scene = await createLoadedScene(g.game);
    panel = new g.E({ scene });
    factory = new ViewObjectFactory(
      scene,
      panel,
      (_scene, _) => new g.E({ scene: _scene })
    );
    listener = new ListenerContainer<Simple>();
  });

  afterEach(() => {
    recreateGame();
  });

  it("viewer object is created after onDone event", () => {
    const subject = new Simple();
    connect(factory, listener);
    listener._add(subject);
    expect(panel.children).toBeUndefined();
    listener._done();
    expect(panel.children.length).toEqual(1);
  });

  it("viewer object is removed after onDelete event", () => {
    const subject = new Simple();
    connect(factory, listener);
    listener._add(subject);
    listener._done();
    expect(panel.children.length).toEqual(1);
    listener._delete(subject);
    expect(panel.children.length).toEqual(0);
  });
});
