import { genBonus, toBonus, toSuffixString } from "../_helper/bonus";
import { execute, resetGame } from "../_helper/game";
import { buildNModel } from "../_helper/model_n";

describe("[e2e] n model", () => {
  afterEach(() => {
    resetGame();
  });

  it.each(Array.from(genBonus()).map((b) => toSuffixString(b)))(
    "%s",
    async (key) =>
      await execute({
        name: "model_n",
        suffix: key,
        builder: buildNModel,
        bonuses: toBonus(key),
      }),
    10000
  );
});
