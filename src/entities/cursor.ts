const createCursor = (loadedScene: g.Scene) => {
  const panel = new g.E({ scene: loadedScene });

  return panel;
};

export default createCursor;
