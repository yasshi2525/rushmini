import model from "models";
import createRailBuildGuide from "entities/railbuild_guide";
import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => void;
const activeOpacity = 0.75;
const inactiveOpacity = 0.25;

describe("railbuild_guide", () => {
  let scene: g.Scene;

  beforeEach(async () => {
    scene = await createLoadedScene(g.game);
  });

  afterEach(() => {
    model.reset();
    recreateGame();
  });

  it("guide listen to model", () => {
    const panel = createRailBuildGuide(scene);
    expect(model.stateListeners.length).toEqual(1);
    expect(panel.opacity).toEqual(activeOpacity);

    model.start(0, 0);
    expect(panel.opacity).toEqual(inactiveOpacity);
    model.end();
    expect(panel.visible()).toBeFalsy();
    model.reset();
    expect(panel.visible()).toBeTruthy();
  });
});
