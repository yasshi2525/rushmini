import { main } from "main";
import ticker from "utils/ticker";

declare const recreateGame: () => Promise<void>;
const DEFAULT_GAME = 110;
const ENDING = 10;

describe("main", () => {
  afterEach(async () => {
    await recreateGame();
  });

  it("set default value when timelimit is not given", () => {
    main({
      sessionParameter: {},
      isAtsumaru: false,
      random: g.game.random,
    });
    expect(ticker.getRemainGameTime()).toEqual(DEFAULT_GAME);
  });

  it("set timelimit value to ticker", () => {
    const TOTAL = 120;
    main({
      sessionParameter: {
        totalTimeLimit: TOTAL,
      },
      isAtsumaru: false,
      random: g.game.random,
    });
    expect(ticker.getRemainGameTime()).toEqual(TOTAL - ENDING);
  });
});
