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
        guide.hide();
        scene.modified();
    })

    return guide;
}

type Point = {x: number, y: number};
type RailLine = {
    chain: Point[],
    fixed: boolean,
};

const getDrawer = (scene: g.Scene) => {
    const primaryLine: RailLine = { chain: [], fixed: false };

    const panel = new g.FilledRect({
        scene,
        x: 0,
        y: 0,
        width: g.game.width,
        height: g.game.height,
        cssColor: "#ffffff",
        opacity: 0.25,
        touchable: true,
        tag: primaryLine
    });

    panel.pointDown.add(ev => {
        if (panel.children) {
            const copy: g.E[] = [];
            panel.children.forEach(c => copy.push(c));
            copy.forEach(c => panel.remove(c));
        }
        primaryLine.chain = [ev.point];
        primaryLine.fixed = false;
        panel.opacity = 0.25;
        panel.modified();
    });

    panel.pointMove.add(ev => {
        // 前イベントが発生した点へ線を結ぶ
        const before = primaryLine.chain[primaryLine.chain.length - 1];
        const now: Point = {
            x: ev.point.x + ev.startDelta.x,
            y: ev.point.y + ev.startDelta.y,
        };
        const d = Math.sqrt(ev.prevDelta.x * ev.prevDelta.x 
            + ev.prevDelta.y * ev.prevDelta.y);
        primaryLine.chain.push(now);
        panel.append(new g.FilledRect({
            scene,
            x: (before.x + now.x) / 2 - 2.5,
            y: (before.y + now.y) / 2 - 2.5,
            width: d,
            height: 5,
            anchorX: 0.5,
            anchorY: 0.5,
            angle: Math.atan2(ev.prevDelta.y, ev.prevDelta.x) * 180 / Math.PI,
            cssColor: "#000000",
        }));
        panel.modified();
    });

    panel.pointUp.add(() => {
        primaryLine.fixed = true;
        panel.opacity = 1.0;
        panel.modified();
    })

    return panel;
}

export const getGameScene = () => {
    const scene = new g.Scene({ game: g.game });

    scene.append(getDrawer(scene));
    scene.append(getGuideE(scene));

    scene.append(new g.SystemLabel({
        scene,
        text: "路線を敷こう",
        fontSize: 20,
        x: g.game.width / 2,
        y: 30,
        textAlign: g.TextAlign.Center
    }));
    return scene;
}