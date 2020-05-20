import Train from "models/train";

import { toBonus } from "../_helper/bonus";
import { execute, genParam, resetGame } from "../_helper/game";
import { buildSlashModel } from "../_helper/model_slash";

const oldTcap = Train.CAPACITY;
const oldTmob = Train.MOBILITY_SEC;
const bonus = "sbtr";

const setDefault = () => {
  Train.CAPACITY = oldTcap;
  Train.MOBILITY_SEC = oldTmob;
};

describe("[e2e] param train", () => {
  afterEach(() => {
    setDefault();
    resetGame();
  });

  it.each(Array.from(genParam(4, 80, 4)))(
    `Train.CAPACITY (%i)`,
    async (v) =>
      execute({
        name: "train_capacity",
        suffix: `${v}`,
        prepare: () => {
          Train.CAPACITY = v;
        },
        bonuses: toBonus(bonus),
        builder: buildSlashModel,
      }),
    10000
  );

  it.each(Array.from(genParam(2, 40, 2)))(
    `Train.MOBILITY (%i)`,
    async (v) =>
      execute({
        name: "train_mobility",
        suffix: `${v}`,
        prepare: () => {
          Train.MOBILITY_SEC = v;
        },
        bonuses: toBonus(bonus),
        builder: buildSlashModel,
      }),
    10000
  );
});
