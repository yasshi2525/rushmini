export const createLoadedScene = (loadsAssets: boolean = false) =>
  new Promise<g.Scene>((resolve) => {
    const opts: g.SceneParameterObject = { game: g.game, name: "mock" };
    if (loadsAssets) {
      opts.assetIds = [
        "company_image",
        "human_image",
        "residence_image",
        "station_image",
        "train_image",
      ];
    }
    const scene = new g.Scene(opts);

    scene.loaded.add(() => {
      resolve(scene);
    });
    g.game.pushScene(scene);
    g.game.tick(false);
  });
