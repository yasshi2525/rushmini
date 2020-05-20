import Platform from "models/platform";

import { toBonus } from "../_helper/bonus";
import { execute, genParam, resetGame } from "../_helper/game";
import { buildSlashModel } from "../_helper/model_slash";

const oldPcap = Platform.CAPACITY;
const bonus = "sbtr";

const setDefault = () => {
  Platform.CAPACITY = oldPcap;
};

describe("[e2e] param platform", () => {
  afterEach(() => {
    setDefault();
    resetGame();
  });

  it.each(Array.from(genParam(2, 40, 2)))(
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
});
