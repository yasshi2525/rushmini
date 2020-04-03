export const getTitleScene = (next: g.Scene) => {
    const scene = new g.Scene({ game: g.game });
    scene.loaded.add(() => {
        scene.append(new g.FilledRect({
            scene,
            width: 640,
            height: 320,
            cssColor: "#aabbcc"
        }));
        scene.append(new g.SystemLabel({
            scene,
            text: "社畜を電車で運べ",
            fontSize: 50,
            x: 320,
            y: 50,
            textAlign: g.TextAlign.Center
        }));
        const button = new g.FilledRect({
            scene,
            x: 220,
            y: 200,
            width: 100,
            height: 50,
            cssColor: "#aa5533",
            touchable: true
        });
        button.pointDown.add(() => {
            button.cssColor = "#883311";
            button.modified();
        });
        button.pointUp.add(() => {
            g.game.replaceScene(next);
        });
        scene.append(button);
    });
    return scene;
}