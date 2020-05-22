import creators from "entities/creator";
import preserveEntityCreator from "entities/loader";
import cityResource from "models/city_resource";
import modelListener from "models/listener";
import userResource from "models/user_resource";
import random from "utils/random";
import routeFinder from "utils/route_finder";
import scorer from "utils/scorer";
import transportFinder from "utils/transport_finder";
import viewer, { ViewerType } from "utils/viewer";

import { createLoadedScene } from "../_helper/scene";

beforeEach(() => {
  random.init(new g.XorshiftRandomGenerator(0));
});

describe("bonus_train", () => {
  let scene: g.Scene;
  let panel: g.E;
  let train: g.E;
  let shadow: g.E;

  beforeEach(async () => {
    scorer.init({ score: 0 });
    scene = await createLoadedScene();
    creators.init();
    preserveEntityCreator();
    viewer.init(scene);
    panel = viewer.viewers[ViewerType.BONUS];
    shadow = viewer.viewers[ViewerType.SHADOW];
    train = viewer.viewers[ViewerType.BONUS_TRAIN];
  });

  afterEach(() => {
    viewer.reset();
    creators.reset();
    userResource.reset();
    cityResource.reset();
    routeFinder.reset();
    transportFinder.reset();
    modelListener.flush();
    modelListener.unregisterAll();
    scorer.reset();
    g.game.popScene();
    g.game.tick(false);
  });

  it("press increases train", () => {
    expect(panel.visible()).toBeFalsy();
    expect(shadow.visible()).toBeFalsy();

    userResource.start(0, 0);
    userResource.extend(100, 0);
    userResource.end();

    scorer.add(1000);
    expect(panel.visible()).toBeTruthy();
    expect(train.visible()).toBeTruthy();
    expect(shadow.visible()).toBeTruthy();

    train.children[1].pointUp.fire();
    expect(panel.visible()).toBeFalsy();
    expect(shadow.visible()).toBeFalsy();
    g.game.tick(false);
  });
});
