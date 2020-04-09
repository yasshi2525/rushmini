const titleFontSize = 50;
const titleOffsetY = 50;

/**
 * タイトルに表示する説明文
 * @param loadedScene 
 */
const createInstraction = (loadedScene: g.Scene) => {
    const panel = new g.E({ 
        scene: loadedScene, 
        width: g.game.width,
        height: g.game.height,
        touchable: true
    });
    panel.append(new g.FilledRect({
        scene: loadedScene,
        x: 0,
        y: 0,
        width: panel.width,
        height: panel.height,
        cssColor: "#aabbcc"
    }));
    panel.append(new g.SystemLabel({
        scene: loadedScene,
        text: "社畜を電車で運べ",
        fontSize: titleFontSize,
        x: g.game.width / 2,
        y: titleOffsetY,
        textAlign: g.TextAlign.Center
    }));
    
    return panel;
};

export default createInstraction;