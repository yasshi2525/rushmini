import Company from "models/company";
import Gate from "models/gate";
import PathFinder from "models/path_finder";
import Platform from "models/platform";
import { distance } from "models/pointable";
import RailNode from "models/rail_node";
import Residence from "models/residence";
import Station from "models/station";

describe("path_finding", () => {
  it("without train", () => {
    const c = new Company(1, 9, 12);
    const r = new Residence([c], 0, 0);
    const instance = new PathFinder(c);
    instance.node(r);
    instance.edge(r, c, distance(c, r));
    instance.execute();
    expect(r.nextFor(c)).toEqual(c);
    expect(r.distanceFor(c)).toEqual(15);
  });

  it("with train", () => {
    const c = new Company(1, 9, 12);
    const r = new Residence([c], 0, 0);
    const rn1 = new RailNode(3, 4);
    const st1 = new Station();
    const p1 = new Platform(rn1, st1);
    const g1 = st1.gate;
    const rn2 = new RailNode(6, 8);
    const st2 = new Station();
    const p2 = new Platform(rn2, st2);
    const g2 = st2.gate;
    const instance = new PathFinder(c);

    instance.node(r);
    instance.node(g1);
    instance.node(p1);
    instance.node(g2);
    instance.node(p2);
    instance.edge(r, g1, distance(g1, r));
    instance.edge(r, g2, distance(g2, r));
    instance.edge(r, c, distance(c, r));
    instance.edge(g1, p1, distance(p1, g1));
    instance.edge(g1, c, distance(g1, c));
    instance.edge(p1, g1, distance(g1, p1));
    instance.edge(p1, p2, distance(p2, p1) / 5);
    instance.edge(g2, p2, distance(p2, g2));
    instance.edge(g2, c, distance(c, g2));
    instance.edge(p2, g2, distance(g2, p2));
    instance.edge(p2, p1, distance(p1, p2) / 5);
    instance.execute();

    expect(r.nextFor(c)).toEqual(g1);
    expect(r.distanceFor(c)).toEqual(11);
    expect(g1.nextFor(c)).toEqual(p1);
    expect(g1.distanceFor(c)).toEqual(6);
    expect(p1.nextFor(c)).toEqual(p2);
    expect(p1.distanceFor(c)).toEqual(6);
    expect(p2.nextFor(c)).toEqual(g2);
    expect(p2.distanceFor(c)).toEqual(5);
    expect(g2.nextFor(c)).toEqual(c);
    expect(g2.distanceFor(c)).toEqual(5);
  });

  it("update cost", () => {
    const c = new Company(1, 9, 12);
    const r = new Residence([c], 0, 0);
    const instance = new PathFinder(c);
    instance.node(r);
    instance.node(c);
    instance.edge(r, c, 15);
    instance.edge(r, c, 10);
    instance.execute();
    expect(r.distanceFor(c)).toEqual(10);
  });

  it("update next", () => {
    const c = new Company(1, 9, 12);
    const r = new Residence([c], 0, 0);
    const rn1 = new RailNode(3, 4);
    const st1 = new Station();
    const p1 = new Platform(rn1, st1);
    const g1 = st1.gate;
    const rn2 = new RailNode(6, 8);
    const st2 = new Station();
    const p2 = new Platform(rn2, st2);
    const g2 = st2.gate;

    const instance = new PathFinder(c);
    instance.node(r);
    instance.node(c);
    instance.edge(r, c, 15);

    instance.execute();
    expect(r.nextFor(c)).toEqual(c);

    instance.node(g1);
    instance.node(p1);
    instance.node(g2);
    instance.node(p2);
    instance.edge(r, g1, distance(g1, r));
    instance.edge(g1, p1, distance(p1, g1));
    instance.edge(p1, p2, distance(p2, p1) / 5);
    instance.edge(p2, g2, distance(g2, p2));
    instance.edge(g2, c, distance(c, g2));

    instance.execute();
    expect(r.nextFor(c)).toEqual(g1);
  });

  it("unroute nextFor returns undefined", () => {
    const c = new Company(1, 9, 12);
    const r = new Residence([c], 0, 0);
    expect(r.nextFor(c)).toBeUndefined();
    expect(r.distanceFor(c)).toBeNaN();
  });
});
