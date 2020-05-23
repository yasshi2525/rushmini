import Human from "models/human";

import { toBonus } from "../_helper/bonus";
import { execute, genParam, resetGame } from "../_helper/game";
import { buildSlashModel } from "../_helper/model_slash";

const oldHlife = Human.LIFE_SPAN;
const oldHbuff = Human.STAY_BUFF;
const bonus = "sbtr";

const setDefault = () => {
  Human.LIFE_SPAN = oldHlife;
  Human.STAY_BUFF = oldHbuff;
};

describe("[e2e] param human", () => {
  afterEach(() => {
    setDefault();
    resetGame();
  });

  it.each(Array.from(genParam(1, 20, 1)))(
    `Human.LIFE_SPAN (%i)`,
    async (v) =>
      await execute({
        name: "human_life_span",
        suffix: `${v}`,
        prepare: () => {
          Human.LIFE_SPAN = v;
        },
        bonuses: toBonus(bonus),
        builder: buildSlashModel,
      }),
    10000
  );

  it.each(Array.from(genParam(0.05, 1, 0.05)))(
    `Human.STAY_BUFF (%d)`,
    async (v) =>
      await execute({
        name: "human_stay_buff",
        suffix: `${v}`,
        prepare: () => {
          Human.STAY_BUFF = v;
        },
        bonuses: toBonus(bonus),
        builder: buildSlashModel,
      }),
    10000
  );
});
