import random from "utils/random";

describe("random", () => {
  it("init", () => {
    const gen: g.RandomGenerator = new g.XorshiftRandomGenerator(0);
    random.init(gen);
    expect(random.random()).toEqual(gen);
  });
});
