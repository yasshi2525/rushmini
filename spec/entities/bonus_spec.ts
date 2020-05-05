import createBonusPanel from "entities/bonus";
import createBonusComponent from "entities/bonus_component";
import modelListener from "models/listener";
import scorer from "utils/scorer";
import { createLoadedScene } from "../_helper/scene";

declare const recreateGame: () => Promise<void>;
const FIRST_BONUS = 1000;

describe("bonus", () => {
  let scene: g.Scene;

  beforeEach(async () => {
    scene = await createLoadedScene();
    scorer.init({ score: 0 });
  });

  afterEach(async () => {
    modelListener.flush();
    modelListener.unregisterAll();
    await recreateGame();
  });

  it("pop up modal when 1st bonus score is god", () => {
    let counter = 0;
    const bonus = createBonusPanel(scene, () => counter++);

    expect(bonus.visible()).toBeFalsy();
    expect(counter).toEqual(0);
    scorer.add(FIRST_BONUS);
    expect(bonus.visible()).toBeTruthy();
    expect(counter).toEqual(1);
  });

  it("pop down modal when select button preesed", () => {
    let counter = 0;
    const bonus = createBonusPanel(scene, () => counter++);
    const component = createBonusComponent(scene, "dummy", 0, () =>
      bonus.hide()
    );

    scorer.add(FIRST_BONUS);
    expect(bonus.visible()).toBeTruthy();
    expect(counter).toEqual(1);

    component.pointDown.fire();
    expect(bonus.visible()).toBeFalsy();
    expect(counter).toEqual(1);
  });
});
