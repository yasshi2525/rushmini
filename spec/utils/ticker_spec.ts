import ticker, { EventType } from "utils/ticker";

declare const recreateGame: () => void;

const FPS = 30;
const DEFAULT_GAME = 60;
const GAME = 120;
const ENDING = 10;

describe("ticker", () => {
  describe("init", () => {
    beforeEach(() => {
      ticker.init(FPS, GAME + ENDING);
    });

    it("init without value", () => {
      ticker.init(60);
      expect(ticker.getRemainGameTime()).toEqual(DEFAULT_GAME);
      expect(ticker.isExpired()).toBe(false);
    });

    it("init with undefined value", () => {
      ticker.init(60, undefined);
      expect(ticker.getRemainGameTime()).toEqual(DEFAULT_GAME);
      expect(ticker.isExpired()).toBe(false);
    });

    it("init with value", () => {
      const _GAME = 90;
      ticker.init(60, _GAME + ENDING);
      expect(ticker.getRemainGameTime()).toEqual(_GAME);
      expect(ticker.isExpired()).toBe(false);
    });
  });

  describe("step", () => {
    beforeEach(() => {
      ticker.init(FPS, GAME + ENDING);
    });

    it("change game time sec after invoking in 'FPS' times", () => {
      expect(ticker.getRemainGameTime()).toEqual(GAME);

      for (let i = 0; i < FPS; i++) {
        ticker.step();
        expect(ticker.getRemainGameTime()).toEqual(GAME - 1);
      }

      ticker.step();
      expect(ticker.getRemainGameTime()).toEqual(GAME - 2);
    });

    it("forbit non-negative remain frame", () => {
      for (let i = 0; i < FPS * (GAME + ENDING) - 1; i++) {
        ticker.step();
      }
      expect(ticker.isExpired()).toBeFalsy();
      ticker.step();
      expect(ticker.isExpired()).toBeTruthy();
      ticker.step();
      expect(ticker.isExpired()).toBeTruthy();
    });
  });

  describe("register", () => {
    beforeEach(() => {
      ticker.init(FPS, GAME + ENDING);
    });

    afterEach(() => {
      recreateGame();
    });

    it("step", () => {
      const scene = new g.Scene({ game: g.game });
      g.game.pushScene(scene);
      g.game.tick(false);
      ticker.register(scene);
      expect(ticker.getRemainGameTime()).toEqual(GAME);
      g.game.tick(true);
      expect(ticker.getRemainGameTime()).toEqual(GAME - 1);
    });
  });

  describe("notify", () => {
    beforeEach(() => {
      ticker.init(FPS, GAME + ENDING);
    });

    it("notify changing second", () => {
      let sec = NaN;
      let counter = 0;
      ticker.triggers.find(EventType.SECOND).register((v) => {
        counter++;
        sec = v;
      });
      expect(sec).toBe(NaN);
      expect(counter).toBe(0);
      for (let i = 0; i < FPS; i++) {
        ticker.step();
        expect(sec).toBe(GAME - 1);
        expect(counter).toBe(1);
      }
      ticker.step();
      expect(sec).toBe(GAME - 2);
      expect(counter).toBe(2);
    });

    it("notify game over", () => {
      let counter = 0;
      ticker.triggers.find(EventType.OVER).register(() => counter++);
      for (let i = 0; i < FPS * GAME - 1; i++) {
        ticker.step();
        expect(counter).toBe(0);
      }
      ticker.step();
      expect(counter).toBe(1);
    });
  });
});
