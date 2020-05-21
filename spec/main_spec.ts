import { main } from "main";
import modelListener, { EventType } from "models/listener";
import scorer from "utils/scorer";
import { CommuteEvent } from "utils/statics";
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
    expect((await execute()).length).toBeGreaterThan(0);
  });

  it("set tweet message when score changed", () => {
    let message = undefined;
    window.RPGAtsumaru = {
      screenshot: {
        setScreenshotHandler: () => {},
        setTweetMessage: (str: string) => {
          message = str;
        },
      },
    };
    main({ sessionParameter: {}, isAtsumaru: true, random: g.game.random });
    scorer.add(10);
    expect(message).not.toBeUndefined();
  });

  it("set tweet message when commuter changed", () => {
    let message = undefined;
    window.RPGAtsumaru = {
      screenshot: {
        setScreenshotHandler: () => {},
        setTweetMessage: (str: string) => {
          message = str;
        },
      },
    };
    main({ sessionParameter: {}, isAtsumaru: true, random: g.game.random });
    modelListener.add(EventType.CREATED, new CommuteEvent(10));
    modelListener.fire(EventType.CREATED);
    expect(message).not.toBeUndefined();
  });
});
