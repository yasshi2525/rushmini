import { DespawnEvent } from "../entities/human_despawner";
import { ScoreViewEvent } from "../entities/score_view";
import viewer, { ViewerEvent } from "../utils/viewer";
import Human from "./human";
import modelListener, { EventType } from "./listener";
import Point from "./point";
import Residence from "./residence";
import Station from "./station";
import Train from "./train";
import userResource from "./user_resource";

export abstract class Advice {
  /**
   * これが true のアドバイスは、発火条件がみたされたならば即座に表示されます
   */
  public forceOverride: boolean = false;
  /**
   * adviceの表示を発火すべきか返します
   */
  public abstract shouldFired(): boolean;
  /**
   * 表示期間がすぎても、これがtrueを返す間、掲載を続けます
   */
  public shouldKeep() {
    return false;
  }
  /**
   * 表示期間中でも、これがtrueを返せば掲載を取りやめます
   */
  public shouldClose() {
    return false;
  }
  /**
   * ユーザに見せたい座標を返します
   */
  public abstract get pointer(): Point;
  /**
   * スプライトのアセットキーを返します
   */
  public abstract get guide(): string;
}

/**
 * ゲーム開始時のアドバイス
 */
export class InitialAdvice extends Advice {
  protected isCommitted: boolean;
  constructor() {
    super();
    userResource.stateListeners.push({
      onCommitted: () => (this.isCommitted = true),
    });
  }
  public shouldFired() {
    return true;
  }
  public shouldKeep() {
    return !this.isCommitted;
  }
  public shouldClose() {
    return this.isCommitted;
  }
  public get pointer(): Point {
    return undefined;
  }
  public get guide() {
    return "init";
  }
}

/**
 * 線路を使われるような形で敷くようアドバイス
 */
export class RollbackAdvice extends Advice {
  public forceOverride: boolean = true;
  protected isRollbacked: boolean;
  protected isCommitted: boolean;
  constructor() {
    super();
    userResource.stateListeners.push({
      onRollback: () => (this.isRollbacked = true),
      onCommitted: () => (this.isCommitted = true),
    });
  }

  public shouldFired() {
    return this.isRollbacked && !this.isCommitted; // 分岐のときは発火させない
  }
  public shouldKeep() {
    return !this.isCommitted;
  }
  public shouldClose() {
    return this.isCommitted;
  }

  public get pointer(): Point {
    return undefined;
  }
  public get guide() {
    return "rollback";
  }
}

/**
 * 開業後のアドバイス
 */
export class OpeningAdvice extends Advice {
  protected isCommitted: boolean = false;
  constructor() {
    super();
    userResource.stateListeners.push({
      onCommitted: () => (this.isCommitted = true),
    });
  }
  public shouldFired() {
    return this.isCommitted;
  }
  public get pointer(): Point {
    return undefined;
  }
  public get guide() {
    return "opening";
  }
}

/**
 * 初得点時
 */
export class ScoredAdvice extends Advice {
  protected watch: ScoreViewEvent;
  constructor() {
    super();
    modelListener.find(EventType.CREATED, ScoreViewEvent).register((ev) => {
      // 掲載後はポインタを変えない
      if (!this.watch && ev.value > 0) this.watch = ev;
    });
    modelListener.find(EventType.DELETED, ScoreViewEvent).register((ev) => {
      if (ev === this.watch) this.watch = undefined;
    });
  }
  public shouldFired() {
    return this.watch !== undefined;
  }
  public get pointer(): Point {
    return this.watch
      ? new Point(
          this.watch.panel.x +
            this.watch.sprite.x +
            this.watch.sprite.width / 2,
          this.watch.panel.y +
            this.watch.sprite.y +
            this.watch.sprite.height / 2
        )
      : undefined;
  }
  public get guide() {
    return "scored";
  }
}

export class CrowdedTrainAdvice extends Advice {
  protected isTrainBonused: boolean = false;
  protected src: Train;
  constructor() {
    super();
    // 増発後はアドバイスを表示させない
    viewer.register(
      ViewerEvent.TRAIN_ENDED,
      () => (this.isTrainBonused = true)
    );
    modelListener.find(EventType.MODIFIED, Train).register((t) => {
      if (this.src?.passengers.length < Train.CAPACITY) this.src = undefined;
      if (!this.src && t.passengers.length === Train.CAPACITY) this.src = t;
    });
  }
  public shouldFired() {
    return this.src && !this.isTrainBonused;
  }
  public get pointer(): Point {
    return this.src?.loc();
  }
  public get guide() {
    return "crowded_train";
  }
}

export class DespawnAdvice extends Advice {
  protected watch: DespawnEvent;
  constructor() {
    super();
    modelListener.find(EventType.CREATED, DespawnEvent).register((ev) => {
      if (!this.watch && !ev.isArchived) this.watch = ev;
    });
    modelListener.find(EventType.DELETED, DespawnEvent).register((ev) => {
      if (ev === this.watch) this.watch = undefined;
    });
  }
  public shouldFired() {
    return this.watch !== undefined;
  }
  public get pointer(): Point {
    return this.watch
      ? new Point(
          this.watch.panel.x +
            this.watch.sprite.x +
            this.watch.sprite.width / 2,
          this.watch.panel.y +
            this.watch.sprite.y +
            this.watch.sprite.height / 2
        )
      : undefined;
  }
  public get guide() {
    return "despawn";
  }
}

export class CrowdedStationAdvice extends Advice {
  protected isTrainBonused: boolean = false;
  protected src: Station;
  constructor() {
    super();
    viewer.register(
      ViewerEvent.TRAIN_ENDED,
      () => (this.isTrainBonused = true)
    );
    modelListener.find(EventType.MODIFIED, Station).register((st) => {
      if (this.src?.gate.inQueue.length < 10) this.src = undefined;
      if (!this.src && st.gate.inQueue.length >= 10) this.src = st;
    });
  }
  public shouldFired() {
    return this.src !== undefined;
  }
  public get pointer(): Point {
    return this.src
      ? new Point(this.src.loc().x, this.src.loc().y + 15)
      : undefined;
  }
  public get guide() {
    return this.isTrainBonused ? "crowded_station" : "crowded_station_train";
  }
}

export class DirectResidence extends Advice {
  protected isCommitted: boolean = false;
  protected src: Residence;
  constructor() {
    super();
    userResource.stateListeners.push({
      onCommitted: () => (this.isCommitted = true),
    });
    modelListener.find(EventType.CREATED, Human).register((h) => {
      if (
        this.isCommitted &&
        !this.src &&
        h.departure.nextFor(h.destination) === h.destination
      )
        this.src = h.departure;
    });
  }
  public shouldFired() {
    return this.src !== undefined;
  }
  public get pointer(): Point {
    return this.src.loc();
  }
  public get guide() {
    return "directed";
  }
}

const generate = () => [
  new InitialAdvice(),
  new RollbackAdvice(),
  new OpeningAdvice(),
  new ScoredAdvice(),
  new CrowdedTrainAdvice(),
  new DespawnAdvice(),
  new CrowdedStationAdvice(),
  new DirectResidence(),
];

const advices = {
  list: [] as Advice[],
  init: () => {
    advices.list = generate();
  },
  reset: () => {
    advices.list.length = 0;
  },
};

export default advices;
