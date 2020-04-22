import random from "utils/random";
import modelListener from "models/listener";
import Residence from "models/residence";
import Company from "models/company";
import { CityResource } from "models/city_resource";

const oldAREA = CityResource.AREA;

const SEED = 1;
const WIDTH = 800;
const HEIGHT = 640;
const AREA = 100;

describe("city_resource", () => {
  let randomChecker: g.RandomGenerator;
  let rs: Residence[];
  let cs: Company[];

  beforeEach(() => {
    random.init(new g.XorshiftRandomGenerator(SEED));
    randomChecker = new g.XorshiftRandomGenerator(SEED);
    CityResource.AREA = AREA;
    rs = [];
    cs = [];
    modelListener.residence.register({
      onDone: (r) => rs.push(r),
      onDelete: () => {},
    });
    modelListener.company.register({
      onDone: (c) => cs.push(c),
      onDelete: () => {},
    });
  });
  afterEach(() => {
    modelListener.flush();
    modelListener.residence._unregisterAll();
    modelListener.company._unregisterAll();
  });

  afterAll(() => {
    CityResource.AREA = oldAREA;
  });

  it("residence and company is built on initialize", () => {
    const model = new CityResource();
    model.init(WIDTH, HEIGHT);
    modelListener.done();
    expect(cs.length).toEqual(1);
    const c = cs[0];
    expect(c.x).toEqual(randomChecker.get(WIDTH - AREA, WIDTH));
    expect(c.y).toEqual(randomChecker.get(HEIGHT - AREA, HEIGHT));
    expect(rs.length).toEqual(1);
    const r = rs[0];
    expect(r.x).toEqual(randomChecker.get(0, AREA));
    expect(r.y).toEqual(randomChecker.get(0, AREA));
  });
});
