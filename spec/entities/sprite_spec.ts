import { createSquareSprite } from "entities/sprite";
import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => Promise<void>;

describe("sprite", () => {
  let scene: g.Scene;

  beforeEach(async () => {
    scene = await createLoadedScene();
    scene.assets["hoge"] = g.game.resourceFactory.createImageAsset(
      "hoge",
      "hoge",
      512,
      512
    );
  });

  afterEach(async () => {
    await recreateGame();
  });

  it("1x", () => {
    const p = createSquareSprite(scene, "hoge", 512);
  });
});
