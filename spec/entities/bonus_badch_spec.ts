import creators from "entities/creator";
import createHelp from "entities/help";
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

describe("bonus_badgh", () => {
  let scene: g.Scene;
  let badge: g.E;
  let bonus: g.E;
  let shadow: g.E;

  beforeEach(async () => {
    scene = await createLoadedScene();
    scorer.init({ score: 0 });
    creators.init();
    preserveEntityCreator();
    viewer.init(scene);
    bonus = viewer.viewers[ViewerType.BONUS];
    shadow = viewer.viewers[ViewerType.SHADOW];
    badge = viewer.viewers[ViewerType.BONUS_BADGE];
  });

  afterEach(() => {
    viewer.reset();
    creators.reset();
    modelListener.flush();
    modelListener.unregisterAll();
    g.game.popScene();
    g.game.tick(false);
  });

  it("badge is hidden in initial state", () => {
    expect(badge.visible()).toBeFalsy();
  });

  it("badge is visible after bonus", () => {
    scorer.add(FIRST_BONUS);
    expect(bonus.visible()).toBeTruthy();
    expect(shadow.visible()).toBeTruthy();
    expect(badge.visible()).toBeTruthy();
    const icon = badge.children[0];
    const minimize = badge.children[1];
    expect(icon.visible()).toBeFalsy();
    expect(minimize.visible()).toBeTruthy();
  });

  it("bonus is hidden after badge is clicked", () => {
    scorer.add(FIRST_BONUS);
    const icon = badge.children[0];
    const minimize = badge.children[1];
    minimize.pointUp.fire();

    expect(icon.visible()).toBeTruthy();
    expect(minimize.visible()).toBeFalsy();
    expect(bonus.visible()).toBeFalsy();
    expect(shadow.visible()).toBeFalsy();
    expect(badge.visible()).toBeTruthy();
    g.game.tick(true);
  });

  it("bonus is ignored when minimized", () => {
    scorer.add(FIRST_BONUS);
    const icon = badge.children[0];
    const minimize = badge.children[1];
    minimize.pointUp.fire();

    scorer.add(SECOND_BONUS);
    expect(bonus.visible()).toBeFalsy();
    expect(shadow.visible()).toBeFalsy();
    expect(badge.visible()).toBeTruthy();
    g.game.tick(true);
  });

  it("bonus is reopened after badge is clicked", () => {
    scorer.add(FIRST_BONUS);
    const icon = badge.children[0];
    const minimize = badge.children[1];
    minimize.pointUp.fire();

    icon.pointUp.fire();

    expect(icon.visible()).toBeFalsy();
    expect(minimize.visible()).toBeTruthy();
    expect(bonus.visible()).toBeTruthy();
    expect(shadow.visible()).toBeTruthy();
    expect(badge.visible()).toBeTruthy();
    g.game.tick(true);
  });
});
