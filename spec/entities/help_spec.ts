import createHelp from "entities/help";
import ticker from "utils/ticker";

import { createLoadedScene } from "../_helper/scene";

const FPS = 60;

beforeAll(() => {
  ticker.init(FPS);
});

describe("help", () => {
  let scene: g.Scene;
  let panel: g.E;

  beforeEach(async () => {
    scene = await createLoadedScene();
    panel = createHelp(scene);
  });

  afterEach(() => {
    g.game.popScene();
    g.game.tick(false);
  });

  it("click show detail", () => {
    const button = panel.children[0];
    const instruction = panel.children[1];
    expect(instruction.visible()).toBeFalsy();
    button.pointUp.fire();
    expect(instruction.visible()).toBeTruthy();
    g.game.tick(false);
  });

  it("touch hide detail", () => {
    const button = panel.children[0];
    const instruction = panel.children[1];
    button.pointUp.fire();
    expect(instruction.visible()).toBeTruthy();
    instruction.pointUp.fire();
    expect(instruction.visible()).toBeFalsy();
    g.game.tick(false);
  });
});
