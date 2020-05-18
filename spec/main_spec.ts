import { stringify } from "querystring";

import { main } from "main";
import ticker from "utils/ticker";

declare const window: { RPGAtsumaru: any };
const DEFAULT_GAME = 110;
const ENDING = 10;

describe("main", () => {
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

  it("do nothing API is not set", () => {
    main({ sessionParameter: {}, isAtsumaru: true, random: g.game.random });
  });

  it("handle screen shot", async () => {
    let cacheCallback: () => Promise<string>;
    window.RPGAtsumaru = {
      screenshot: {
        setScreenshotHandler: (cb: () => Promise<string>) => {
          cacheCallback = cb;
        },
      },
    };
    const execute = async () => {
      return await cacheCallback();
    };
    main({ sessionParameter: {}, isAtsumaru: true, random: g.game.random });
    window.RPGAtsumaru.screenshot;
    expect((await execute()).length).toBeGreaterThan(0);
  });
});
