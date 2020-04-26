import random from "utils/random";
import modelListener, { EventType } from "models/listener";
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
    modelListener
      .find(EventType.CREATED, Residence)
      .register((r) => rs.push(r));
    modelListener.find(EventType.CREATED, Company).register((c) => cs.push(c));
  });

  afterEach(() => {
    modelListener.flush();
    modelListener.unregisterAll();
  });

  afterAll(() => {
    CityResource.AREA = oldAREA;
  });

  it("residence and company is built on initialize", () => {
    const model = new CityResource();
    model.init(WIDTH, HEIGHT, (min, max) => random.random().get(min, max));
    expect(cs.length).toEqual(1);
    const c = cs[0];
    expect(c.loc().x).toEqual(randomChecker.get(WIDTH - AREA, WIDTH));
    expect(c.loc().y).toEqual(randomChecker.get(HEIGHT - AREA, HEIGHT));
    expect(rs.length).toEqual(1);
    const r = rs[0];
    expect(r.loc().x).toEqual(randomChecker.get(0, AREA));
    expect(r.loc().y).toEqual(randomChecker.get(0, AREA));
  });
});
