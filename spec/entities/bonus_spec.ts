import createBonusPanel from "entities/bonus";
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
    await recreateGame();
  });

  it("pop up modal when 1st bonus score is god", () => {
    const bonus = createBonusPanel(scene);

    expect(bonus.visible()).toBeFalsy();
    scorer.add(FIRST_BONUS);
    expect(bonus.visible()).toBeTruthy();
    for (let i = 0; i < 4; i++) {
      expect(bonus.children[i]).toBeTruthy();
    }
  });

  it("pop down modal when select button preesed", () => {
    const bonus = createBonusPanel(scene);
    scorer.add(FIRST_BONUS);
    expect(bonus.visible()).toBeTruthy();
    const selectedButton = bonus.children[1];
    selectedButton.pointDown.fire();
    expect(bonus.visible()).toBeFalsy();
  });
});
