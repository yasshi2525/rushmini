import Company from "./company";
import Human from "./human";
import Vector from "./vector";

class Residence extends Vector {
  /**
   * 会社の魅力度に応じて住民をスポーンするため、
   * 魅力度の数だけ同じ会社を行き先に設定する
   */
  private readonly destinations: Company[] = [];

  constructor(destinations: Company[], x: number, y: number) {
    super(x, y);
    destinations.forEach((c) => {
      for (var i = 0; i < c.attractiveness; i++) {
        this.destinations.push(c);
      }
    });
  }

  public _spawn() {
    if (this.destinations.length === 0) {
      console.warn("no destination candinate");
      return undefined;
    }
    const dest = this.destinations.shift();
    this.destinations.push(dest);
    return new Human(this, dest);
  }
}

export default Residence;
