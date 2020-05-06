import scorer, { ScoreListener, ScoreStorage } from "utils/scorer";

describe("scorer", () => {
  let state: ScoreStorage;
  beforeEach(() => {
    state = { score: 0 };
  });
  it("init", () => {
    scorer.init(state);
    expect(scorer.get()).toEqual(0);
  });
  it("add", () => {
    scorer.init(state);
    scorer.add(1);
    expect(scorer.get()).toEqual(1);
  });
  it("prevent minus score", () => {
    scorer.init(state);
    scorer.add(-1);
    expect(scorer.get()).toEqual(0);
  });
  it("observe", () => {
    let result = 0;
    const listener: ScoreListener = (v) => (result = v);
    scorer.init(state);
    scorer.register(listener);
    expect(result).toEqual(0);
    scorer.add(1);
    expect(result).toEqual(1);
  });
});
