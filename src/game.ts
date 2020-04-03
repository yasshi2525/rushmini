const getGuideE = (scene: g.Scene) => {
    const guide = new g.E({ scene, touchable: true });

    guide.append(new g.FilledRect({
        scene,
        x: 20,
        y: 30,
        width: 10,
        height: 10,
        cssColor: "#aa5533",
        opacity: 0.5
    }));

    guide.append(new g.FilledRect({
        scene,
        x: g.game.width - 30,
        y: g.game.height - 30,
        width: 10,
        height: 10,
        cssColor: "#aa5533",
        opacity: 0.5
    }));

    guide.append(new g.FilledRect({
        scene,
        x: 20,
        y: g.game.height / 2,
        width: 500,
        height: 50,
        cssColor: "#aa5533",
        opacity: 0.5,
        angle: 20,
    }));

    scene.pointDownCapture.add(() => {
        guide.destroy();
        scene.modified();
    })

    return guide;
}

export const getGameScene = () => {
    const scene = new g.Scene({ game: g.game });

    scene.append(new g.SystemLabel({
        scene,
        text: "路線を敷こう",
        fontSize: 20,
        x: g.game.width / 2,
        y: 30,
        textAlign: g.TextAlign.Center
    }));

    scene.append(getGuideE(scene));
    return scene;
}