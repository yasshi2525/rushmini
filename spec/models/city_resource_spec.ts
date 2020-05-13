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
  let rs: Residence[];
  let cs: Company[];

  beforeEach(() => {
    random.init(new g.XorshiftRandomGenerator(SEED));
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
    expect(cs.length).toEqual(2);
    const c0 = cs[0];
    expect(c0.loc().x).toEqual(WIDTH - AREA);
    expect(c0.loc().y).toEqual(HEIGHT - AREA);
    const c1 = cs[1];
    expect(c1.loc().x).toBeGreaterThanOrEqual(WIDTH / 2);
    expect(c1.loc().x).toBeLessThanOrEqual(WIDTH);
    expect(c1.loc().y).toBeGreaterThanOrEqual(HEIGHT / 2);
    expect(c1.loc().y).toBeLessThanOrEqual(HEIGHT);

    expect(rs.length).toEqual(1);
    const r0 = rs[0];
    expect(r0.loc().x).toEqual(AREA);
    expect(r0.loc().y).toEqual(AREA);
  });

  it("residence build randomly", () => {
    const model = new CityResource();
    model.init(WIDTH, HEIGHT, (min, max) => random.random().get(min, max));

    model.residence(); // NW
    expect(rs.length).toEqual(2);
    expect(rs[1].loc().x).toBeGreaterThanOrEqual(0);
    expect(rs[1].loc().x).toBeLessThanOrEqual(WIDTH / 2);
    expect(rs[1].loc().y).toBeGreaterThanOrEqual(0);
    expect(rs[1].loc().y).toBeLessThanOrEqual(HEIGHT / 2);

    model.residence(); // SW
    expect(rs.length).toEqual(3);
    expect(rs[2].loc().x).toBeGreaterThanOrEqual(0);
    expect(rs[2].loc().x).toBeLessThanOrEqual(WIDTH / 2);
    expect(rs[2].loc().y).toBeGreaterThanOrEqual(HEIGHT / 2);
    expect(rs[2].loc().y).toBeLessThanOrEqual(HEIGHT);

    model.residence(); // NE
    expect(rs.length).toEqual(4);
    expect(rs[3].loc().x).toBeGreaterThanOrEqual(WIDTH / 2);
    expect(rs[3].loc().x).toBeLessThanOrEqual(WIDTH);
    expect(rs[3].loc().y).toBeGreaterThanOrEqual(0);
    expect(rs[3].loc().y).toBeLessThanOrEqual(HEIGHT / 2);

    model.residence(); // SW
    expect(rs.length).toEqual(5);
    expect(rs[4].loc().x).toBeGreaterThanOrEqual(WIDTH / 2);
    expect(rs[4].loc().x).toBeLessThanOrEqual(WIDTH);
    expect(rs[4].loc().y).toBeGreaterThanOrEqual(HEIGHT / 2);
    expect(rs[4].loc().y).toBeLessThanOrEqual(HEIGHT);
    model.residence();
  });
});
