import ticker from "utils/ticker";

const FPS = 30;
const DEFAULT_GAME = 110;
const GAME = 60;
const ENDING = 10;

describe("ticker", () => {
  describe("init", () => {
    beforeEach(() => {
      ticker.init(FPS, GAME + ENDING);
    });

    it("init without value", () => {
      ticker.init(60);
      expect(ticker.getRemainGameTime()).toEqual(DEFAULT_GAME);
    });

    it("init with undefined value", () => {
      ticker.init(60, undefined);
      expect(ticker.getRemainGameTime()).toEqual(DEFAULT_GAME);
    });

    it("init with value", () => {
      const _GAME = 90;
      ticker.init(60, _GAME + ENDING);
      expect(ticker.getRemainGameTime()).toEqual(_GAME);
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
      expect(ticker.isExpired()).toEqual(false);
      ticker.step();
      expect(ticker.isExpired()).toEqual(true);
      ticker.step();
      expect(ticker.isExpired()).toEqual(true);
    });
  });

  describe("register", () => {
    beforeEach(() => {
      ticker.init(FPS, GAME + ENDING);
    });

    it("step if scene is current", () => {
      const scene = new g.Scene({ game: g.game });
      g.game.pushScene(scene);
      g.game.tick(false);
      ticker.register(scene);
      expect(ticker.getRemainGameTime()).toEqual(GAME);
      g.game.tick(true);
      expect(ticker.getRemainGameTime()).toEqual(GAME - 1);
    });

    it("forbit to step if scene is not current", () => {
      const main = new g.Scene({ game: g.game });
      g.game.pushScene(main);
      const other = new g.Scene({ game: g.game });
      g.game.pushScene(other);
      expect(ticker.getRemainGameTime()).toEqual(GAME);
      g.game.tick(false);
      //ticker.register(main);
      expect(ticker.getRemainGameTime()).toEqual(GAME);
    });
  });
});
