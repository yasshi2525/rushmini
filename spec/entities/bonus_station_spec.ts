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

const scoreBorders = [1000, 2000, 4000, 8000];

beforeEach(() => {
  random.init(new g.XorshiftRandomGenerator(0));
});

describe("bonus_station", () => {
  let scene: g.Scene;
  let panel: g.E;
  let station: g.E;
  let shadow: g.E;
  let station_builder: g.E;
  let undo: g.E;

  beforeEach(async () => {
    scorer.init({ score: 0 });
    scene = await createLoadedScene();
    creators.init();
    preserveEntityCreator();
    viewer.init(scene);
    panel = viewer.viewers[ViewerType.BONUS];
    station = viewer.viewers[ViewerType.BONUS_STATION];
    shadow = viewer.viewers[ViewerType.SHADOW];
    station_builder = viewer.viewers[ViewerType.STATION_BUILDER];
    undo = viewer.viewers[ViewerType.BONUS_UNDO];
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

  it("button can be pushed after bonus panel is opened", () => {
    expect(panel.visible()).toBeFalsy();

    scorer.add(scoreBorders[0]);
    expect(panel.visible()).toBeTruthy();
    expect(station.visible()).toBeTruthy();
  });

  it("bonus panel is hidden after button is pushed", () => {
    scorer.add(scoreBorders[0]);
    station.children[1].pointUp.fire();

    expect(panel.visible()).toBeFalsy();
    g.game.tick(false);
  });

  it("viewer mask is enabled after click bonus panel", () => {
    expect(shadow.visible()).toBeFalsy();

    scorer.add(scoreBorders[0]);

    expect(shadow.visible()).toBeTruthy();

    station.pointUp.fire();

    expect(shadow.visible()).toBeTruthy();
    g.game.tick(false);
  });

  it("undo canceled action", () => {
    expect(undo.visible()).toBeFalsy();
    scorer.add(scoreBorders[0]);
    expect(undo.visible()).toBeFalsy();
    station.children[1].pointUp.fire();
    expect(undo.visible()).toBeTruthy();
    undo.pointUp.fire();
    expect(undo.visible()).toBeFalsy();
    expect(viewer.isBonusing).toBeTruthy();
    expect(panel.visible()).toBeTruthy();
    expect(station.children[1].visible()).toBeTruthy();
    expect(shadow.visible()).toBeTruthy();
    expect(station_builder.visible()).toBeFalsy();
    g.game.tick(true);
  });
});
