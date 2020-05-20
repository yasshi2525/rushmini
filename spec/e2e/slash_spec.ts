import userResource, { ModelState } from "models/user_resource";
import viewer, { ViewerType } from "utils/viewer";

import {
  BONUS_SET,
  BONUS_TYPE,
  Record,
  handleBonus,
  output,
  pointDown,
  pointMove,
  pointUp,
  resetGame,
  startGame,
  toBonus,
  toSuffixString,
} from "../_helper/e2e";

const start = { x: 150, y: 150 };
const edge = { x: 400, y: 250 };
const station = { x: 250, y: 210 };
const branch_start = { x: 365, y: 290 };
const branch_edge = { x: -200, y: 125 };

const pos = (ratio: number) => ({
  x: ratio * edge.x,
  y: ratio * edge.y,
});

const branchPos = (ratio: number) => ({
  x: ratio * branch_edge.x,
  y: ratio * branch_edge.y,
});

const buildModel = () => {
  const sensor = viewer.viewers[ViewerType.BUILDER];
  pointDown(sensor, start);
  g.game.tick(true);
  expect(userResource.getState()).toEqual(ModelState.STARTED);

  for (let i = 0; i <= 1; i += 0.05) {
    pointMove(sensor, start, pos(i));
    g.game.tick(true);
  }
  pointUp(sensor, start, pos(1));
  g.game.tick(true);
  expect(userResource.getState()).toEqual(ModelState.FIXED);
};

const onBranch = () => {
  const sensor = viewer.viewers[ViewerType.BRANCH_BUILDER];
  expect(sensor.visible()).toBeTruthy();
  pointDown(sensor, branch_start);
  g.game.tick(true);
  expect(userResource.getState()).toEqual(ModelState.STARTED);

  for (let i = 0; i <= 1; i += 0.05) {
    pointMove(sensor, branch_start, branchPos(i));
    g.game.tick(true);
    expect(userResource.getState()).toEqual(ModelState.STARTED);
  }
  pointUp(sensor, branch_start, branchPos(1));
  g.game.tick(true);
  expect(userResource.getState()).toEqual(ModelState.FIXED);
};

const onStation = () => {
  const sensor = viewer.viewers[ViewerType.STATION_BUILDER];
  pointUp(sensor, station, { x: 0, y: 0 });
};

const onResidence = () => {
  const sensor = viewer.viewers[ViewerType.RESIDENCE_BUILDER];
  pointUp(sensor, pos(0), { x: 0, y: 0 });
};

const toHandler = (bonuses: BONUS_TYPE[]) =>
  bonuses.map((bonus) => {
    switch (bonus) {
      case BONUS_TYPE.STATION:
        return { key: bonus, fn: onStation };
      case BONUS_TYPE.BRANCH:
        return { key: bonus, fn: onBranch };
      case BONUS_TYPE.TRAIN:
        return { key: bonus, fn: () => {} };
      case BONUS_TYPE.RESIDENCE:
        return { key: bonus, fn: onResidence };
    }
  });

const loop = (
  sig: () => boolean,
  bonus: { key: BONUS_TYPE; fn: () => void }[]
) => {
  do {
    handleBonus(bonus);
    g.game.tick(true);
  } while (!sig());
};

describe("[e2e] slash model", () => {
  afterEach(() => {
    resetGame();
  });

  it.each(BONUS_SET.map((b) => toSuffixString(b)))(
    "%s",
    async (key) => {
      const csv: Record[] = [];
      let sig = false;
      const signal = () => sig;
      const bonuses = toBonus(key);
      startGame("slash", key, csv, () => (sig = true));
      buildModel();
      loop(signal, toHandler(bonuses));
      await output("slash", key, csv);
    },
    10000
  );
});
