import { createLoadedScene } from "../_helper/scene";
import createRailViewer from "entities/railviewer";
import userResource from "models/user_resource";
import modelListener from "models/listener";

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
    expect(panel.children.length).toEqual(1);
    userResource.start(0, 0);
    expect(panel.children.length).toEqual(2);
    const station = panel.children[1].children[0];
    expect(station).toBeInstanceOf(g.FilledRect);
    expect((station as g.FilledRect).cssColor).toEqual("#112233");
  });

  it("building edge creates panel", () => {
    const panel = createRailViewer(scene);
    expect(panel.children.length).toEqual(1);
    userResource.start(0, 0);
    userResource.extend(10, 10);
    expect(panel.children.length).toEqual(4);
    const outbound = panel.children[2].children[0];
    expect(outbound).toBeInstanceOf(g.FilledRect);
    expect((outbound as g.FilledRect).cssColor).toEqual("#000000");
    const inbound = panel.children[3].children[0];
    expect(inbound).toBeInstanceOf(g.FilledRect);
    expect((inbound as g.FilledRect).cssColor).toEqual("#000000");
  });
});
