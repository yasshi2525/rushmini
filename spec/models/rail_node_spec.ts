import RailNode from "models/rail_node";

describe("rail_node", () => {
  it("creation", () => {
    const X = 1;
    const Y = 2;
    const rn = new RailNode(X, Y);
    expect(rn.x).toEqual(X);
    expect(rn.y).toEqual(Y);
  });

  describe("_extend", () => {
    const X = 3;
    const Y = 4;
    const from = new RailNode(0, 0);
    const outE = from._extend(X, Y);
    const to = outE.to;
    const inE = outE.reverse;

    it("create 'to'", () => {
      // (3, 4) に線が作られている
      expect(to.x).toEqual(X);
      expect(to.y).toEqual(Y);
    });

    it("'outE' connects 'from' and 'to'", () => {
      // outE が from と to をつないでいる
      expect(outE.from).toEqual(from);
      expect(outE.to).toEqual(to);
    });

    it("'inE' connects 'to' and 'from'", () => {
      // inE が to と from をつないでいる
      expect(inE.from).toEqual(to);
      expect(inE.to).toEqual(from);
    });

    it("'from' links 'outE'", () => {
      // from から outE が出ている
      expect(from.out).toContain(outE);
      expect(from.in).not.toContain(outE);
    });

    it("'from' links 'inE'", () => {
      // from に inE が入っている
      expect(from.out).not.toContain(inE);
      expect(from.in).toContain(inE);
    });

    it("'to' links 'outE'", () => {
      // to に outE が入っている
      expect(to.out).not.toContain(outE);
      expect(to.in).toContain(outE);
    });

    it("'to' links 'inE'", () => {
      // to に inE が入っている
      expect(to.out).toContain(inE);
      expect(to.in).not.toContain(inE);
    });

    it("'outE' is reverses 'inE'", () => {
      expect(outE.reverse).toEqual(inE);
      expect(inE.reverse).toEqual(outE);
    });
  });

  describe("buildPlatform", () => {
    it("platform", () => {
      const rn = new RailNode(0, 0);
      const p = rn._buildStation();

      expect(rn.platform).toEqual(p);
      expect(p.on).toEqual(rn);
    });

    it("error when duplication building", () => {
      const rn = new RailNode(0, 0);
      const p1 = rn._buildStation();
      const p2 = rn._buildStation();

      expect(p1).toEqual(p2);
    });
  });
});
