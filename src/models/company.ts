import Human, { HumanState } from "./human";
import modelListener, { EventType } from "./listener";
import PointableObject from "./pointable";

class Company extends PointableObject {
  /**
   * 住民がこの会社を行き先として選ぶ度合い 自身/全会社の合計 の割合で行き先が選ばれる
   */
  public readonly attractiveness: number;

  constructor(attractiveness: number, x: number, y: number) {
    super(x, y) /* istanbul ignore next */;
    if (attractiveness <= 1) {
      attractiveness = 1;
    }
    this.attractiveness = attractiveness;
    modelListener.add(EventType.CREATED, this);
  }

  /**
   * 指定された移動者を自身に向かって移動させる。到達したならば完了
   * @param subject
   */
  public _fire(subject: Human) {
    if (subject._seek(this)) {
      subject.state(HumanState.ARCHIVED);
      subject._complete();
    } else {
      subject.state(HumanState.MOVE);
    }
  }

  public _giveup(subject: Human) {
    // do-nothing
  }
}

export default Company;
