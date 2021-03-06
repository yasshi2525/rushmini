import modelListener from "models/listener";
import RailEdge from "models/rail_edge";
import RailNode from "models/rail_node";

afterAll(() => {
  modelListener.flush();
});

describe("rail_edge", () => {
  it("connect rail_node on creation", () => {
    const from = new RailNode(0, 0);
    const to = new RailNode(1, 1);
    const re = new RailEdge(from, to, true);
    expect(re.from).toEqual(from);
    expect(re.to).toEqual(to);
    expect(re.isOutbound).toEqual(true);
    // from -> re -> to
    // 向きがあっているかテスト
    expect(from.in).not.toContain(re);
    expect(from.out).toContain(re);
    expect(to.in).toContain(re);
    expect(to.out).not.toContain(re);
  });
});
