import Vector from "./vector";
import modelListener from "./listener";

class Company extends Vector {
  /**
   * 住民がこの会社を行き先として選ぶ度合い 自身/全会社の合計 の割合で行き先が選ばれる
   */
  public readonly attractiveness: number;

  constructor(attractiveness: number, x: number, y: number) {
    super(x, y);
    if (attractiveness <= 1) {
      attractiveness = 1;
    }
    this.attractiveness = attractiveness;
    modelListener.company.add(this);
  }
}

export default Company;
