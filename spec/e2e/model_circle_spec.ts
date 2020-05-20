import { genBonus, toBonus, toSuffixString } from "../_helper/bonus";
import { execute, resetGame } from "../_helper/game";
import { buildCircleModel } from "../_helper/model_circle";

describe("[e2e] circle model", () => {
  afterEach(() => {
    resetGame();
  });

  it.each(Array.from(genBonus()).map((b) => toSuffixString(b)))(
    "%s",
    async (key) =>
      execute({
        name: "model_circle",
        suffix: key,
        builder: buildCircleModel,
        bonuses: toBonus(key),
      }),
    10000
  );
});
