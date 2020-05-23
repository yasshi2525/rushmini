import Residence from "models/residence";

import { toBonus } from "../_helper/bonus";
import { execute, genParam, resetGame } from "../_helper/game";
import { buildSlashModel } from "../_helper/model_slash";

const oldRint = Residence.INTERVAL_SEC;
const bonus = "sbtr";

const setDefault = () => {
  Residence.INTERVAL_SEC = oldRint;
};

describe("[e2e] param residence", () => {
  afterEach(() => {
    setDefault();
    resetGame();
  });

  it.each(Array.from(genParam(0.1, 2, 0.1)))(
    `Residence.INTERVAL_SEC (%d)`,
    async (v) =>
      await execute({
        name: "residence_interval",
        suffix: `${v}`,
        prepare: () => {
          Residence.INTERVAL_SEC = v;
        },
        bonuses: toBonus(bonus),
        builder: buildSlashModel,
      }),
    10000
  );
});
