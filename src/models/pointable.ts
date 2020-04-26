import Point, {
  center as _center,
  distance as _distance,
  substract as _substract,
} from "./point";
import RoutableObject from "./routable";

export interface Pointable {
  loc(): Point;
}

abstract class PointableObject extends RoutableObject implements Pointable {
  private readonly _location: Point;

  constructor(x: number, y: number) {
    super();
    this._location = new Point(x, y);
  }

  public loc() {
    return this._location;
  }
}

/**
 * 差分ベクトルを返します。差分が極めて小さい場合、ZeroPoint を返します
 * @param to
 * @param from
 */
export const substract = (to: Pointable, from: Pointable) =>
  _substract(to.loc(), from.loc());

/**
 * 中点を返します
 * @param to
 * @param from
 */
export const center = (to: Pointable, from: Pointable) =>
  _center(to.loc(), from.loc());

/**
 * 距離を返します。差分が極めて小さい場合、0を返します
 * @param to
 * @param from
 */
export const distance = (to: Pointable, from: Pointable) =>
  _distance(to.loc(), from.loc());

export default PointableObject;
