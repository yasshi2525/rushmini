import createRailBuildGuide from "entities/build_guide";
import modelListener from "models/listener";
import userResource from "models/user_resource";
import viewer, { ViewerEvent } from "utils/viewer";

import { createLoadedScene } from "../_helper/scene";

const activeOpacity = 0.5;
const inactiveOpacity = 0.5;

describe("railbuild_guide", () => {
  let scene: g.Scene;
  let panel: g.E;

  beforeEach(async () => {
    scene = await createLoadedScene();
    panel = createRailBuildGuide(scene);
    userResource.init();
  });

  afterEach(async () => {
    userResource.reset();
    modelListener.flush();
  });

  it("guide listen to model", () => {
    expect(userResource.stateListeners.length).toEqual(1);
    expect(panel.visible()).toBeTruthy();

    userResource.start(0, 0);
    expect(panel.opacity).toEqual(inactiveOpacity);
    userResource.extend(300, 400);
    userResource.end();
    expect(panel.visible()).toBeTruthy(); // イベント発火で消える
  });

  it("guide reopen when rollback", () => {
    expect(userResource.stateListeners.length).toEqual(1);
    expect(panel.visible()).toBeTruthy();

    userResource.start(0, 0);
    expect(panel.opacity).toEqual(inactiveOpacity);
    userResource.end();
    expect(panel.visible()).toBeTruthy();
  });

  it("animation stop in touch start when invisible", () => {
    expect(panel.children[1].update.length).toEqual(1);
    panel.hide();
    for (let i = 0; i < g.game.fps + 1; i++) g.game.tick(true);
    expect(panel.children[1].update.length).toEqual(0);
  });

  it("animation stop in touch move when invisible", () => {
    for (let i = 0; i < g.game.fps + 1; i++) g.game.tick(true);
    expect(panel.children[1].update.length).toEqual(1);
    panel.hide();
    for (let i = 0; i < g.game.fps * 3 + 1; i++) g.game.tick(true);
    expect(panel.children[1].update.length).toEqual(0);
  });

  it("animation stop in touch end when invisible", () => {
    for (let i = 0; i < g.game.fps + 1; i++) g.game.tick(true);
    expect(panel.children[1].update.length).toEqual(1);
    for (let i = 0; i < g.game.fps * 3 + 1; i++) g.game.tick(true);
    expect(panel.children[1].update.length).toEqual(1);
    panel.hide();
    for (let i = 0; i < g.game.fps + 2; i++) g.game.tick(true);
    expect(panel.children[1].update.length).toEqual(0);
  });
});
