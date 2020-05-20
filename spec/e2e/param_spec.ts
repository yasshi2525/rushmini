import Gate from "models/gate";
import Platform from "models/platform";
import Train from "models/train";

import { toBonus } from "../_helper/bonus";
import { execute, resetGame } from "../_helper/game";
import { buildSlashModel } from "../_helper/model_slash";

const genParam = function* (min: number, max: number, step: number) {
  for (let i = min; i <= max; i += step) yield i;
};

const oldGcap = Gate.CAPACITY;
const oldPcap = Platform.CAPACITY;
const oldTcap = Train.CAPACITY;
const bonus = "sbtr";

describe("[e2e] param", () => {
  afterEach(() => {
    Gate.CAPACITY = oldGcap;
    Platform.CAPACITY = oldPcap;
    Train.CAPACITY = oldTcap;
    resetGame();
  });

  it.each(Array.from(genParam(5, 100, 5)))(
    `Gate.CAPACITY (%i)`,
    async (v) =>
      execute({
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

  it.each(Array.from(genParam(5, 100, 5)))(
    `Platform.CAPACITY (%i)`,
    async (v) =>
      execute({
        name: "platform_capacity",
        suffix: `${v}`,
        prepare: () => {
          Platform.CAPACITY = v;
        },
        bonuses: toBonus(bonus),
        builder: buildSlashModel,
      }),
    10000
  );

  it.each(Array.from(genParam(5, 100, 5)))(
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
});
