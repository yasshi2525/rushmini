import RailNode from "models/rail_node";
import RailEdge from "models/rail_edge";
import modelListener from "models/listener";

afterAll(() => {
  modelListener.flush();
});

describe("rail_edge", () => {
  it("connect rail_node on creation", () => {
    const from = new RailNode(0, 0);
    const to = new RailNode(1, 1);
    const re = new RailEdge(from, to);
    expect(re.from).toEqual(from);
    expect(re.to).toEqual(to);
    // from -> re -> to
    // 向きがあっているかテスト
    expect(from.in).not.toContain(re);
    expect(from.out).toContain(re);
    expect(to.in).toContain(re);
    expect(to.out).not.toContain(re);
  });
});
