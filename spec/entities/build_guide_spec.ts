import createRailBuildGuide from "entities/build_guide";
import modelListener from "models/listener";
import userResource from "models/user_resource";

import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => Promise<void>;
const activeOpacity = 0.5;
const inactiveOpacity = 0.5;

describe("railbuild_guide", () => {
  let scene: g.Scene;
  let panel: g.E;

  beforeEach(async () => {
    scene = await createLoadedScene(true);
    panel = createRailBuildGuide(scene);
    userResource.init();
  });

  afterEach(async () => {
    userResource.reset();
    modelListener.flush();
    await recreateGame();
  });

  it("guide listen to model", () => {
    expect(userResource.stateListeners.length).toEqual(1);
    expect(panel.visible()).toBeTruthy();

    userResource.start(0, 0);
    expect(panel.opacity).toEqual(inactiveOpacity);
    userResource.end();
    expect(panel.visible()).toBeFalsy();
    userResource.reset();
  });
});
