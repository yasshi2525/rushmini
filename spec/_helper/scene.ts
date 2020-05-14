export const createLoadedScene = (loadsAssets: boolean = false) =>
  new Promise<g.Scene>((resolve) => {
    const opts: g.SceneParameterObject = { game: g.game, name: "mock" };
    if (loadsAssets) {
      opts.assetIds = [
        "company_basic",
        "human_basic",
        "residence_basic",
        "residence_bonus_enabled",
        "residence_bonus_disabled",
        "station_basic",
        "station_candidate",
        "station_covered",
        "station_bonus_enabled",
        "station_bonus_disabled",
        "train_basic",
        "train_bonus_enabled",
        "train_bonus_disabled",
        "rail_bonus_enabled",
        "rail_bonus_disabled",
        "bonus_txt",
        "frame_main",
      ];
    }
    const scene = new g.Scene(opts);

    scene.loaded.add(() => {
      resolve(scene);
    });
    g.game.pushScene(scene);
    g.game.tick(false);
  });
