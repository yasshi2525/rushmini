import Gate from "models/gate";

import { toBonus } from "../_helper/bonus";
import { execute, genParam, resetGame } from "../_helper/game";
import { buildSlashModel } from "../_helper/model_slash";

const oldGcap = Gate.CAPACITY;
const oldGmob = Gate.MOBILITY_SEC;
const bonus = "sbtr";

const setDefault = () => {
  Gate.CAPACITY = oldGcap;
  Gate.MOBILITY_SEC = oldGmob;
};

describe("[e2e] param gate", () => {
  afterEach(() => {
    setDefault();
    resetGame();
  });

  it.each(Array.from(genParam(1, 20, 1)))(
    `Gate.CAPACITY (%i)`,
    async (v) =>
      await execute({
        name: "gate_capacity",
        suffix: `${v}`,
        prepare: () => {
          Gate.CAPACITY = v;
        },
        bonuses: toBonus(bonus),
        builder: buildSlashModel,
      }),
    10000
  );

  it.each(Array.from(genParam(1, 20, 1)))(
    `Gate.MOBILITY_SEC (%i)`,
    async (v) =>
      await execute({
        name: "gate_mobility",
        suffix: `${v}`,
        prepare: () => {
          Gate.MOBILITY_SEC = v;
        },
        bonuses: toBonus(bonus),
        builder: buildSlashModel,
      }),
    10000
  );
});
