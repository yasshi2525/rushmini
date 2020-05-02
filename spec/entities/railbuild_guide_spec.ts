import createRailBuildGuide from "entities/railbuild_guide";
import modelListener from "models/listener";
import userResource from "models/user_resource";
import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => Promise<void>;
const activeOpacity = 0.75;
const inactiveOpacity = 0.25;

describe("railbuild_guide", () => {
  let scene: g.Scene;

  beforeEach(async () => {
    scene = await createLoadedScene();
  });

  afterEach(async () => {
    userResource.reset();
    modelListener.flush();
    await recreateGame();
  });

  it("guide listen to model", () => {
    const panel = createRailBuildGuide(scene);
    expect(userResource.stateListeners.length).toEqual(1);
    expect(panel.opacity).toEqual(activeOpacity);

    userResource.start(0, 0);
    expect(panel.opacity).toEqual(inactiveOpacity);
    userResource.end();
    expect(panel.visible()).toBeFalsy();
    userResource.reset();
    expect(panel.visible()).toBeTruthy();
  });
});
