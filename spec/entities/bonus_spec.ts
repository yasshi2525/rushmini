import createBonusComponent from "entities/bonus_component";
import creators from "entities/creator";
import preserveEntityCreator from "entities/loader";
import modelListener from "models/listener";
import random from "utils/random";
import scorer from "utils/scorer";
import viewer, { ViewerEvent, ViewerType } from "utils/viewer";

import { createLoadedScene } from "../_helper/scene";

const FIRST_BONUS = 1000;
const SECOND_BONUS = 2000;

beforeAll(() => {
  random.init(new g.XorshiftRandomGenerator(0));
});

describe("bonus", () => {
  let scene: g.Scene;
  let bonus: g.E;

  beforeEach(async () => {
    scene = await createLoadedScene();
    scorer.init({ score: 0 });
    creators.init();
    preserveEntityCreator();
    viewer.init(scene);
    bonus = viewer.viewers[ViewerType.BONUS];
  });

  afterEach(() => {
    viewer.reset();
    creators.reset();
    modelListener.flush();
    modelListener.unregisterAll();
    g.game.popScene();
    g.game.tick(false);
  });

  it("pop up modal when 1st bonus score is god", () => {
    let counter = 0;
    viewer.register(ViewerEvent.USER_BONUS_STARTED, () => counter++);

    expect(bonus.visible()).toBeFalsy();
    expect(counter).toEqual(0);
    scorer.add(FIRST_BONUS);
    expect(bonus.visible()).toBeTruthy();
    expect(counter).toEqual(1);
  });

  it("pop down modal when select button preesed", () => {
    let counter = 0;
    viewer.register(ViewerEvent.USER_BONUS_STARTED, () => counter++);
    const component = createBonusComponent(
      scene,
      "rail",
      0,
      ViewerEvent.BRANCH_STARTED
    );

    scorer.add(FIRST_BONUS);
    expect(bonus.visible()).toBeTruthy();
    expect(counter).toEqual(1);

    component.children[1].pointUp.fire();
    expect(bonus.visible()).toBeFalsy();
    expect(counter).toEqual(1);
    g.game.tick(false);
  });

  it("forbit to re-open during bonus panel is opened", () => {
    let isOpen = false;
    let openCounter = 0;
    viewer.register(ViewerEvent.USER_BONUS_STARTED, () => {
      isOpen = true;
      openCounter++;
    });

    scorer.add(FIRST_BONUS);
    expect(bonus.visible()).toBeTruthy();
    expect(isOpen).toBeTruthy();
    expect(openCounter).toEqual(1);

    scorer.add(SECOND_BONUS - FIRST_BONUS);
    expect(bonus.visible()).toBeTruthy();
    expect(isOpen).toBeTruthy();
    expect(openCounter).toEqual(1);
  });
});
