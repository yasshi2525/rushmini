class Vector {
  public readonly x: number;
  public readonly y: number;
  public readonly length: number;
  public readonly angleRadian: number;
  /**
   * x軸から自ベクトルへの回転角を0-360で表します
   */
  public readonly angleDegree: number;

  constructor(pos: Vector);
  constructor(x: number, y: number);

  constructor(arg1: Vector | number, arg2?: number) {
    if (arg1 instanceof Vector) {
      this.x = arg1.x;
      this.y = arg1.y;
    } else {
      this.x = arg1;
      this.y = arg2;
    }
    this.length = Math.sqrt(this.x * this.x + this.y * this.y);
    this.angleRadian = Math.atan2(this.y, this.x);
    this.angleDegree = (this.angleRadian * 180) / Math.PI;
  }

  public _reverse() {
    return new Vector(-this.x, -this.y);
  }

  /**
   * 自ベクトルと引数のベクトルの成す角度を返す。単位はラジアン、左回り正
   * @param oth
   */
  public _angle(oth: Vector) {
    if (oth.length === 0) {
      console.warn("could not calculate angle to 0-length vector");
      return NaN;
    }
    // 180°以下の角度を求める
    // cos θ = a * b / |a||b|
    var theta = Math.acos(
      (this.x * oth.x + this.y * oth.y) / (this.length * oth.length)
    );

    // 他ベクトルが自ベクトルの右側にある場合(外積の値が負)、
    // 角度を 360° - θ にする
    if (this.x * oth.y - this.y * oth.x < 0) {
      theta = Math.PI * 2 - theta;
    }

    return theta;
  }

  /**
   * 自ベクトルが指すベクトルから引数のベクトルを指すベクトルを返します
   * @param oth
   */
  public _sub(oth: Vector) {
    return new Vector(oth.x - this.x, oth.y - this.y);
  }
}

export default Vector;
