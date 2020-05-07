import modelListener from "models/listener";
import RailNode from "models/rail_node";

afterAll(() => {
  modelListener.flush();
});

describe("rail_node", () => {
  it("creation", () => {
    const X = 1;
    const Y = 2;
    const rn = new RailNode(X, Y);
    expect(rn.loc().x).toEqual(X);
    expect(rn.loc().y).toEqual(Y);
  });

  it("_fire", () => {
    const rn = new RailNode(0, 0);
    rn._fire();
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
      expect(to.loc().x).toEqual(X);
      expect(to.loc().y).toEqual(Y);
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

  describe("left/right", () => {
    const SLIDE = 1;

    it("lonely point returns zero", () => {
      const rn1 = new RailNode(0, 0);
      expect(rn1.left(SLIDE)).toEqual(0);
      expect(rn1.right(SLIDE)).toEqual(0);
    });

    it("dead end returns zero", () => {
      const rn1 = new RailNode(0, 0);
      const e12 = rn1._extend(1, 0);
      expect(e12.from.left(SLIDE)).toEqual(0);
      expect(e12.from.right(SLIDE)).toEqual(0);
      expect(e12.to.left(SLIDE)).toEqual(0);
      expect(e12.to.right(SLIDE)).toEqual(0);
    });

    it("straight returns zero", () => {
      const rn1 = new RailNode(0, 0);
      const e12 = rn1._extend(1, 0);
      const rn2 = e12.to;
      const e23 = rn2._extend(2, 0);
      expect(rn2.in.length).toEqual(2);
      expect(rn2.out.length).toEqual(2);
      expect(rn2.left(SLIDE)).toEqual(0);
      expect(rn2.right(SLIDE)).toEqual(0);
    });

    it("any value returns number", () => {
      for (let i = 0; i < Math.PI * 2; i += 0.1) {
        const rn1 = new RailNode(0, 0);
        const e12 = rn1._extend(1, 0);
        const rn2 = e12.to;
        const e23 = rn2._extend(1 + Math.cos(i), Math.sin(i));
        expect(rn2.left(1)).not.toBeNaN();
        expect(rn2.right(1)).not.toBeNaN();
      }
    });
  });
});
