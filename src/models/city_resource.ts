import Company from "./company";
import modelListener, { EventType } from "./listener";
import Residence from "./residence";

export class CityResource {
  /**
   * この座標領域以内に初期住宅・会社を設立する
   */
  public static AREA: number = 50;
  public static PADDING: number = 50;

  private width: number;
  private height: number;

  public init(
    width: number,
    height: number,
    rand: (min: number, max: number) => number
  ) {
    this.width = width;
    this.height = height;
    const c = new Company(
      1,
      rand(
        width - CityResource.AREA - CityResource.PADDING,
        width - CityResource.PADDING
      ),
      rand(
        height - CityResource.AREA - CityResource.PADDING,
        height - CityResource.PADDING
      )
    );
    const r = new Residence(
      [c],
      rand(CityResource.PADDING, CityResource.AREA + CityResource.PADDING),
      rand(CityResource.PADDING, CityResource.AREA + CityResource.PADDING)
    );
    modelListener.fire(EventType.CREATED);
  }
}

const cityResource = new CityResource();

export default cityResource;
