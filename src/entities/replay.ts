/**
 * 画面全体に占める割合
 */
const scale = 0.9;
const fontSize = 50;

const activeOpacity = 1.0;
const inactiveOpacity = 0.5;

const createReplay = (loadedScene: g.Scene) => {
    const panel = new g.E({ 
        scene: loadedScene,
        x: g.game.width * (1 - scale) / 2,
        y: g.game.height * (1 - scale) / 2,
        width: g.game.width * scale,
        height: g.game.height * scale,
        opacity: activeOpacity,
        touchable: true
    });
    panel.append(new g.SystemLabel({
        scene: loadedScene,
        x: panel.width / 2,
        y: panel.height / 2,
        fontSize,
        textAlign: g.TextAlign.Center,
        text: "Replay"
    }));

    // パネルを押下したとき半透明にする
    panel.pointDown.add(() => {
        panel.opacity = inactiveOpacity;
        panel.modified();
    })
    panel.pointUp.add(() => {
        panel.opacity = activeOpacity;
        panel.modified();
    })

    return panel;
}

export default createReplay;