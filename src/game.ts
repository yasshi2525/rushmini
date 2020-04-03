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

    const toScoreLabel = (score: number) => 
        `SCORE: ${("000" + score).slice(-3)}`;

    const container = new g.E({ scene });

    const scoreLabel = new g.SystemLabel({
        scene,
        x: g.game.width - 100,
        y: 60,
        fontSize: 15,
        text: toScoreLabel(g.game.vars.gameState.score)
    });

    const sensor = new g.FilledRect({
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

    sensor.pointDown.add(ev => {
        if (sensor.children) {
            const copy: g.E[] = [];
            sensor.children.forEach(c => copy.push(c));
            copy.forEach(c => sensor.remove(c));
        }
        primaryLine.chain = [ev.point];
        primaryLine.fixed = false;
        sensor.opacity = 0.25;
        sensor.modified();
    });

    sensor.pointMove.add(ev => {
        // 前イベントが発生した点へ線を結ぶ
        const before = primaryLine.chain[primaryLine.chain.length - 1];
        const now: Point = {
            x: ev.point.x + ev.startDelta.x,
            y: ev.point.y + ev.startDelta.y,
        };
        const d = Math.sqrt(ev.prevDelta.x * ev.prevDelta.x 
            + ev.prevDelta.y * ev.prevDelta.y);
        primaryLine.chain.push(now);
        sensor.append(new g.FilledRect({
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

        // [TODO] debug: remove
        g.game.vars.gameState.score++;
        const old = scoreLabel.text;
        scoreLabel.text = toScoreLabel(g.game.vars.gameState.score)
        if (scoreLabel.text != old) {
            scoreLabel.modified();
        }
        sensor.modified();
    });

    sensor.pointUp.add(() => {
        primaryLine.fixed = true;
        sensor.opacity = 1.0;
        sensor.modified();
    })
    container.append(sensor);
    container.append(scoreLabel);
    return container;
}

export const getGameScene = () => {
    const scene = new g.Scene({ game: g.game });

    const toTickText = (frame: number) =>
    `TIME: ${Math.ceil(g.game.vars.remainFrame / g.game.fps)}`

    const tickLabel = new g.SystemLabel({
        scene,
        text: toTickText(g.game.vars.remainFrame),
        fontSize: 15,
        x: g.game.width - 100,
        y: 30
    })

    scene.loaded.add(() => {
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
        scene.append(tickLabel);
    });
    scene.update.add(() => {
        g.game.vars.updateFrame();
        const old = tickLabel.text;
        tickLabel.text = toTickText(g.game.vars.remainFrame);
        if (old != tickLabel.text) {
            tickLabel.modified();
        }
    })
    return scene;
}