import createRailViewer from "entities/railviewer";
import modelListener from "models/listener";
import userResource from "models/user_resource";
import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => void;

describe("railviewer", () => {
  let scene: g.Scene;
  beforeEach(async () => {
    scene = await createLoadedScene(g.game);
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
    expect(panel.children.length).toEqual(1);
    const container = panel.children[0];
    const station = container.children[0];
    expect(container.x + station.width / 2).toEqual(0);
    expect(container.y + station.height / 2).toEqual(0);
    expect(station).toBeInstanceOf(g.FilledRect);
    expect((station as g.FilledRect).cssColor).toEqual("#112233");
  });

  it("building edge creates panel", () => {
    const panel = createRailViewer(scene);
    expect(panel.children).toBeUndefined();
    userResource.start(0, 0);
    userResource.extend(10, 10);
    expect(panel.children.length).toEqual(3);
    const outContainer = panel.children[1];
    const outbound = outContainer.children[0];
    expect(outContainer.x + outbound.height / 2).toEqual(5);
    expect(outContainer.y + outbound.height / 2).toEqual(5);
    expect(outbound).toBeInstanceOf(g.FilledRect);
    expect((outbound as g.FilledRect).cssColor).toEqual("#000000");
    const inContainer = panel.children[2];
    const inbound = inContainer.children[0];
    expect(inContainer.x + inbound.height / 2).toEqual(5);
    expect(inContainer.y + inbound.height / 2).toEqual(5);
    expect(inbound).toBeInstanceOf(g.FilledRect);
    expect((inbound as g.FilledRect).cssColor).toEqual("#000000");
  });
});
