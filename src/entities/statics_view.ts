import Human, { HumanState } from "../models/human";
import statics from "../utils/statics";
import createFont from "./font";
import { createSquareSprite } from "./sprite";

const UNITS = ["人", "人", "秒", "秒", "秒", "％", "％", "％"];

const SIZE = 0.275;
const PADDING = 0.1;
const FONT_SIZE = 28;
const PARAGRAPH = 1.4;

const appendRow = (parent: g.E, value: number, idx: number) => {
  const label = createSquareSprite(parent.scene, `statics_${idx}_txt`);
  label.x = 0;
  label.y = idx * FONT_SIZE * PARAGRAPH;
  label.modified();
  parent.append(label);

  const valueLabel = new g.Label({
    scene: parent.scene,
    fontSize: FONT_SIZE,
    text: ("   " + value).slice(-3),
    font: createFont("score_main"),
    x: 110,
    y: idx * FONT_SIZE * PARAGRAPH,
  });
  valueLabel.y += label.height - valueLabel.height + 1;
  parent.append(valueLabel);

  const unitLabel = new g.Label({
    scene: parent.scene,
    fontSize: FONT_SIZE,
    text: UNITS[idx],
    font: createFont("score_main"),
    x: 110 + FONT_SIZE * 2.75,
    y: idx * FONT_SIZE * PARAGRAPH,
  });
  unitLabel.y += label.height - unitLabel.height + 1;
  parent.append(unitLabel);
};

const createStaticsPanel = (loadedSccene: g.Scene) => {
  const panel = new g.E({
    scene: loadedSccene,
    width: g.game.width * SIZE,
    height: UNITS.length * FONT_SIZE * PARAGRAPH,
  });
  panel.x = g.game.width * (1 - PADDING) - panel.width;
  panel.y = (g.game.height * PADDING) / 2;
  panel.modified();

  const dy = statics.collect();
  const values = [
    statics.numSpawn,
    dy.numCommuter,
    dy.commuteTime,
    dy.wait[HumanState.WAIT_ENTER_PLATFORM] +
      dy.wait[HumanState.WAIT_ENTER_DEPTQUEUE] +
      dy.wait[HumanState.WAIT_TRAIN_ARRIVAL],
    dy.wait[HumanState.WAIT_ENTER_GATE],
    dy.crowd.Train * 100,
    dy.crowd.Gate * 100,
    dy.crowd.Platform * 100,
  ];
  for (let i = 0; i < UNITS.length; i++) {
    appendRow(panel, Math.floor(values[i]), i);
  }
  return panel;
};

export default createStaticsPanel;
