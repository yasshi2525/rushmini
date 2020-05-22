export const createLoadedScene = () =>
  new Promise<g.Scene>((resolve) => {
    const opts: g.SceneParameterObject = { game: g.game, name: "mock" };
    const scene = new g.Scene(opts);

    scene.loaded.add(() => {
      expect(g.game.scene()).toEqual(scene);
      resolve(scene);
    });
    g.game.pushScene(scene);
    g.game.tick(false);
  });
