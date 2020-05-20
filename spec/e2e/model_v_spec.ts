import { genBonus, toBonus, toSuffixString } from "../_helper/bonus";
import { execute, resetGame } from "../_helper/game";
import { buildVModel } from "../_helper/model_v";

describe("[e2e] v model", () => {
  afterEach(() => {
    resetGame();
  });

  it.each(Array.from(genBonus()).map((b) => toSuffixString(b)))(
    "%s",
    async (key) =>
      execute({
        name: "model_v",
        suffix: key,
        builder: buildVModel,
        bonuses: toBonus(key),
      }),
    10000
  );
});
