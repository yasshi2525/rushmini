import createRailViewer from "entities/railviewer";
import modelListener, { EventType } from "models/listener";
import Train from "models/train";
import userResource from "models/user_resource";
import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => void;

describe("railviewer", () => {
  let scene: g.Scene;
  let t: Train;
  beforeEach(async () => {
    scene = await createLoadedScene(g.game);
    modelListener.find(EventType.CREATED, Train).register((_t) => (t = _t));
  });

  afterEach(() => {
    userResource.reset();
    modelListener.flush();
    recreateGame();
  });

  it("building station creates panel", () => {
    const panel = createRailViewer(scene);
    expect(panel.children).toBeUndefined();
    userResource.start(0, 0);
    expect(panel.children.length).toEqual(2);
    const container = panel.children[1];
    const station = container.children[0];
    expect(container.x + station.width / 2).toEqual(0);
    expect(container.y + station.height / 2).toEqual(0);
    expect(station).toBeInstanceOf(g.FilledRect);
    expect((station as g.FilledRect).cssColor).toEqual("#336699");
  });

  it("building edge creates panel", () => {
    const panel = createRailViewer(scene);
    expect(panel.children).toBeUndefined();
    userResource.start(0, 0);
    userResource.extend(10, 10);
    expect(panel.children.length).toEqual(4);
    const outContainer = panel.children[2];
    const outbound = outContainer.children[0];
    expect(outContainer.x + outbound.height / 2).toEqual(5);
    expect(outContainer.y + outbound.height / 2).toEqual(5);
    expect(outbound).toBeInstanceOf(g.FilledRect);
    expect((outbound as g.FilledRect).cssColor).toEqual("#000000");
    const inContainer = panel.children[3];
    const inbound = inContainer.children[0];
    expect(inContainer.x + inbound.height / 2).toEqual(5);
    expect(inContainer.y + inbound.height / 2).toEqual(5);
    expect(inbound).toBeInstanceOf(g.FilledRect);
    expect((inbound as g.FilledRect).cssColor).toEqual("#000000");
  });

  it("ticking modified train", () => {
    const panel = createRailViewer(scene);
    userResource.start(0, 0);
    userResource.extend(10, 10);
    const trainContainer = panel.children[0];
    const train = trainContainer.children[0];
    expect((train as g.FilledRect).cssColor).toEqual("#008833");
    for (let j = 0; j < 30 * Train.STAY_SEC; j++) {
      t._step();
      modelListener.fire(EventType.MODIFIED);
      expect(trainContainer.x).toEqual(-20);
      expect(trainContainer.y).toEqual(-10);
    }
    t._step();
    modelListener.fire(EventType.MODIFIED);

    expect(trainContainer.x).not.toEqual(-20);
    expect(trainContainer.y).not.toEqual(-10);
  });
});
