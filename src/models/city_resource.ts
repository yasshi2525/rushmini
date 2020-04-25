import Company from "./company";
import Human from "./human";
import modelListener, { EventType } from "./listener";
import Residence from "./residence";

export class CityResource {
  /**
   * この座標領域以内に初期住宅・会社を設立する
   */
  public static AREA: number = 50;

  private width: number;
  private height: number;

  private readonly rs: Residence[] = [];
  private readonly hs: Human[] = [];

  public init(
    width: number,
    height: number,
    rand: (min: number, max: number) => number
  ) {
    this.width = width;
    this.height = height;
    const c = new Company(
      1,
      rand(width - CityResource.AREA, width),
      rand(height - CityResource.AREA, height)
    );
    const r = new Residence(
      [c],
      rand(0, CityResource.AREA),
      rand(0, CityResource.AREA),
      (h) => {
        this.hs.push(h);
      }
    );
    this.rs.push(r);
    modelListener.fire(EventType.CREATED);
  }

  public step(frame: number) {
    this.rs.forEach((r) => r._step(frame));
    this.hs.forEach((h) => h._step(frame));
    modelListener.fire(EventType.CREATED);
    modelListener.fire(EventType.MODIFIED);
  }

  public reset() {
    this.rs.length = 0;
    this.hs.length = 0;
  }
}

const cityResource = new CityResource();

export default cityResource;
