export const createLoadedScene = () =>
  new Promise<g.Scene>((resolve) => {
    const opts: g.SceneParameterObject = { game: g.game, name: "mock" };
    if (!g.game._initialScene.isCurrentScene()) g.game.popScene();
    const scene = new g.Scene(opts);

    scene.loaded.add(() => {
      expect(g.game.scene()).toEqual(scene);
      resolve(scene);
    });
    g.game.pushScene(scene);
    while (!scene.isCurrentScene()) g.game.tick(false);
  });
