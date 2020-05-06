import { CityResource } from "models/city_resource";
import Company from "models/company";
import modelListener, { EventType } from "models/listener";
import Residence from "models/residence";
import random from "utils/random";

const oldPADDING = CityResource.PADDING;
const oldAREA = CityResource.AREA;

const SEED = 1;
const WIDTH = 800;
const HEIGHT = 640;
const AREA = 100;
const PADDING = 100;

afterAll(() => {
  CityResource.AREA = oldAREA;
  CityResource.PADDING = oldPADDING;
});

describe("city_resource", () => {
  let randomChecker: g.RandomGenerator;
  let rs: Residence[];
  let cs: Company[];

  beforeEach(() => {
    random.init(new g.XorshiftRandomGenerator(SEED));
    randomChecker = new g.XorshiftRandomGenerator(SEED);
    CityResource.AREA = AREA;
    CityResource.PADDING = PADDING;
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

  it("residence and company is built on initialize", () => {
    const model = new CityResource();
    model.init(WIDTH, HEIGHT, (min, max) => random.random().get(min, max));
    expect(cs.length).toEqual(1);
    const c = cs[0];
    expect(c.loc().x).toEqual(
      randomChecker.get(WIDTH - AREA - PADDING, WIDTH - PADDING)
    );
    expect(c.loc().y).toEqual(
      randomChecker.get(HEIGHT - AREA - PADDING, HEIGHT - PADDING)
    );
    expect(rs.length).toEqual(1);
    const r = rs[0];
    expect(r.loc().x).toEqual(randomChecker.get(PADDING, AREA + PADDING));
    expect(r.loc().y).toEqual(randomChecker.get(PADDING, AREA + PADDING));
  });
});
