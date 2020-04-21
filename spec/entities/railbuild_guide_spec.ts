import userResource from "models/user_resource";
import createRailBuildGuide from "entities/railbuild_guide";
import { createLoadedScene } from "../_helper/scene";
import modelListener from "models/listener";

declare const recreateGame: () => void;
const activeOpacity = 0.75;
const inactiveOpacity = 0.25;

describe("railbuild_guide", () => {
  let scene: g.Scene;

  beforeEach(async () => {
    scene = await createLoadedScene(g.game);
  });

  afterEach(() => {
    userResource.reset();
    modelListener.flush();
    recreateGame();
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
