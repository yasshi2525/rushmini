import scorer, { ScoreListener } from "../utils/scorer";
import { createFramedRect } from "./rectangle";

const borders = [1000, 2000, 4000, 8000];
const labels = ["新駅建設", "支線建設", "電車増発", "住宅開発"];

const createScoreHandler = (panel: g.E): ScoreListener => {
  const bs = [...borders];
  return (num: number) => {
    if (bs.length > 0 && num >= bs[0]) {
      panel.show();
      bs.shift();
    }
  };
};

const createBonusPanel = (loadedScene: g.Scene) => {
  const panel = createFramedRect(loadedScene, 500, 300, "#aaaaaa", 8);
  panel.x = 50;
  panel.y = 50;
  panel.modified();
  for (let i = 0; i < borders.length; i++) {
    const c = createFramedRect(loadedScene, 100, 100, "#008000", 8);
    c.touchable = true;
    c.x = i * 108 + 50;
    c.y = 100;
    c.modified();
    c.pointDown.add(() => {
      (c.children[0] as g.FilledRect).cssColor = "#888888";
      c.touchable = false;
      c.modified();
      panel.hide();
    });
    c.append(
      new g.SystemLabel({
        x: 20,
        y: 40,
        scene: loadedScene,
        fontSize: 20,
        text: labels[i],
      })
    );
    panel.append(c);
  }
  panel.append(
    new g.SystemLabel({
      x: 40,
      y: 50,
      scene: loadedScene,
      fontSize: 38,
      text: "ボーナスを1つ選んでください",
    })
  );
  panel.hide();
  scorer.observe(createScoreHandler(panel));
  return panel;
};

export default createBonusPanel;
