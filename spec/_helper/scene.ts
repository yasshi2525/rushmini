export const createLoadedScene = (game: g.Game) =>
  new Promise<g.Scene>((resolve) => {
    const scene = new g.Scene({ game });
    scene.loaded.add(() => resolve(scene));
    game.pushScene(scene);
    game.tick(false);
  });
