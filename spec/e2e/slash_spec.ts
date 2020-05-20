import { genBonus, toBonus, toSuffixString } from "../_helper/bonus";
import { execute, resetGame } from "../_helper/game";
import { buildSlashModel } from "../_helper/model_slash";

describe("[e2e] slash model", () => {
  afterEach(() => {
    resetGame();
  });

  it.each(Array.from(genBonus()).map((b) => toSuffixString(b)))(
    "%s",
    async (key) =>
      execute({
        name: "slash",
        suffix: key,
        builder: buildSlashModel,
        bonuses: toBonus(key),
      }),
    10000
  );
});
