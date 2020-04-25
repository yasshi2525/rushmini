const createBackground = (loadedScene: g.Scene) =>
  new g.FilledRect({
    scene: loadedScene,
    x: 0,
    y: 0,
    width: g.game.width,
    height: g.game.height,
    cssColor: "#ffffff",
  });

export default createBackground;
