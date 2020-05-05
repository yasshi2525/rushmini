export const createLoadedScene = (loadsAssets: boolean = false) =>
  new Promise<g.Scene>((resolve) => {
    const opts: g.SceneParameterObject = { game: g.game, name: "mock" };
    if (loadsAssets) {
      opts.assetIds = [
        "company_basic",
        "human_basic",
        "residence_basic",
        "station_basic",
        "station_candidate",
        "station_covered",
        "train_basic",
      ];
    }
    const scene = new g.Scene(opts);

    scene.loaded.add(() => {
      resolve(scene);
    });
    g.game.pushScene(scene);
    g.game.tick(false);
  });
