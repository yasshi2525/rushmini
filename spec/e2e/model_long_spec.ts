import { genBonus, toBonus, toSuffixString } from "../_helper/bonus";
import { execute, resetGame } from "../_helper/game";
import { buildLongModel } from "../_helper/model_long";

describe("[e2e] long model", () => {
  afterEach(() => {
    resetGame();
  });

  it.each(Array.from(genBonus()).map((b) => toSuffixString(b)))(
    "%s",
    async (key) =>
      execute({
        name: "model_long",
        suffix: key,
        builder: buildLongModel,
        bonuses: toBonus(key),
      }),
    10000
  );
});
