import { resetGame, startGame, writeReport } from "../_helper/e2e";

declare const recreateGame: () => Promise<void>;

describe("[e2e] slash model", () => {
  let csv: string[][];

  beforeEach(() => {
    csv = [];
    startGame();
  });
  afterEach(async () => {
    await writeReport("slash", csv);
    resetGame();
    await recreateGame();
  });
});
