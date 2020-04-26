import Company from "models/company";
import modelListener from "models/listener";

afterAll(() => {
  modelListener.flush();
});

describe("company", () => {
  it("initialize", () => {
    const c = new Company(1, 1, 2);
    expect(c.loc().x).toEqual(1);
    expect(c.loc().y).toEqual(2);
  });

  it("forbit non-nature value attractiveness", () => {
    const c1 = new Company(0, 0, 0);
    expect(c1.attractiveness).toEqual(1);
  });
});
