import { createSquareSprite } from "entities/sprite";

import { createLoadedScene } from "../_helper/scene";

describe("sprite", () => {
  let scene: g.Scene;

  beforeEach(async () => {
    scene = await createLoadedScene();
    g.game.assets["hoge"] = g.game.resourceFactory.createImageAsset(
      "hoge",
      "hoge",
      512,
      512
    );
  });

  it("1x", () => {
    const p = createSquareSprite(scene, "hoge", 512);
    expect(p).not.toBeUndefined();
  });
});
