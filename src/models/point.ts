const DELTA = 0.00001;

class Point {
  public readonly x: number;
  public readonly y: number;

  constructor(x: number, y: number);
  constructor(loc: Point);

  constructor(arg1: number | Point, arg2?: number) {
    if (typeof arg1 === "number") {
      this.x = arg1;
      this.y = arg2;
    } else {
      this.x = arg1.x;
      this.y = arg1.y;
    }
  }

  /**
   * 長さを返します
   */
  public length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * x軸から自ベクトルへの回転角をラジアンで表します
   */
  public angle() {
    return Math.atan2(this.y, this.x);
  }

  /**
   * x軸から自ベクトルへの回転角を0-360で表します
   */
  public angleDegree() {
    return (this.angle() * 180) / Math.PI;
  }

  /**
   * 引数の地点と極めて近いか返します
   * @param oth
   */
  public isTooClose(oth: Point) {
    return distance(oth, this, true) < DELTA;
  }

  /**
   * 単位ベクトルを返します
   */
  public unit() {
    return new Point(this.x / this.length(), this.y / this.length());
  }

  public reverse() {
    return new Point(-this.x, -this.y);
  }
}

export const ZeroPoint = new Point(0, 0);

/**
 * to から from を指すベクトルを返します。極めて近い場合 ZeroPoint を返します
 * @param to
 * @param from
 * @param isStrict true の場合、極めて近くとも計算結果を返します
 */
export const substract = (to: Point, from: Point, isStrict = false): Point =>
  !isStrict && to.isTooClose(from)
    ? ZeroPoint
    : new Point(to.x - from.x, to.y - from.y);

/**
 * to と from の中心点を返します。
 * @param to
 * @param from
 */
export const center = (to: Point, from: Point) =>
  new Point((to.x + from.x) / 2, (to.y + from.y) / 2);

/**
 * from から to の距離を返します。極めて近い場合 0 を返します
 * @param to
 * @param from
 * @param isStrict  true の場合、極めて近くとも計算結果を返します
 */
export const distance = (to: Point, from: Point, isStrict = false): number =>
  !isStrict && to.isTooClose(from) ? 0 : substract(to, from, isStrict).length();

const innerProduct = (to: Point, from: Point) => from.x * to.x + from.y * to.y;
const outerProduct = (to: Point, from: Point) => from.x * to.y - from.y * to.x;

/**
 * from ベクトルから to ベクトルの成す角度を返す(ラジアン、左回り正)
 * @param to
 * @param from
 */
export const angle = (to: Point, from: Point) => {
  if (to.isTooClose(from)) {
    console.warn("could not calculate angle to 0-length vector");
    return NaN;
  }
  // 180°以下の角度を求める
  // cos θ = a * b / |a||b|
  const theta = Math.acos(innerProduct(to.unit(), from.unit()));

  // 他ベクトルが自ベクトルの右側にある場合(外積の値が負)、
  // 角度を 360° - θ にする
  return outerProduct(to, from) < 0 ? Math.PI * 2 - theta : theta;
};

export default Point;
