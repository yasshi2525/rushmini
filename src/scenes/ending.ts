import createReplay from "../entities/replay";

export type EndingScene = {
  scene: g.Scene;
  prepare: (titleScene: g.Scene) => void;
};

const preserveShift = (panel: g.E, next: g.Scene) => {
  panel.pointDown.add(() => g.game.replaceScene(next));
};

const createEndingScene = (): EndingScene => {
  const scene = new g.Scene({ game: g.game, name: "ending" });
  return {
    scene,
    prepare: (next: g.Scene) => {
      scene.loaded.add(() => {
        const panel = createReplay(scene);
        preserveShift(panel, next);
        scene.append(panel);
      });
    },
  };
};

export default createEndingScene;
