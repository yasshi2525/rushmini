import Company from "./company";
import random from "../utils/random";
import Residence from "./residence";
import modelListener from "./listener";

export class CityResource {
  /**
   * この座標領域以内に初期住宅・会社を設立する
   */
  public static AREA: number = 10;

  private width: number;
  private height: number;

  init(width: number, height: number) {
    this.width = width;
    this.height = height;
    const rnd = random.random();
    const c = new Company(
      1,
      rnd.get(width - CityResource.AREA, width),
      rnd.get(height - CityResource.AREA, height)
    );
    const r = new Residence(
      [c],
      0.2,
      rnd.get(0, CityResource.AREA),
      rnd.get(0, CityResource.AREA)
    );
    modelListener.done();
    return { company: c, residence: r };
  }
}

const cityResource = new CityResource();

export default cityResource;
