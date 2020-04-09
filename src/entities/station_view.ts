import Station from "../models/station";

const width = 30;
const height = 30;
const cssColor = "#112233"

const createStationPanel = (loadedScene: g.Scene, st: Station) => {
    const panel = new g.E({ scene: loadedScene });
    const pos = st.getPos();
    panel.append(new g.FilledRect({
        scene: loadedScene,
        x: pos.x - width / 2,
        y: pos.y - height / 2,
        width,
        height,
        cssColor
    }));
    return panel;
};

export default createStationPanel;