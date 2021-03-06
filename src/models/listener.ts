import { removeIf } from "../utils/common";

export enum EventType {
  CREATED,
  MODIFIED,
  RIDDEN,
  DELETED,
}

/**
 * オブジェクト単位でイベントハンドラを登録します
 */
export class Tracker<S> {
  /**
   * イベント発火時にコールするハンドラ群
   */
  protected readonly handlers: ((e: S) => void)[];
  /**
   * 追跡対象
   */
  public readonly target: S;

  constructor(tracker: S) {
    this.handlers = [];
    this.target = tracker;
  }

  /**
   * ハンドラを登録する
   * @param handler
   */
  public register(handler: (e: S) => void) {
    this.handlers.push(handler);
  }

  /**
   * イベントを発火し、ハンドラをコールします
   */
  public fire() {
    this.handlers.forEach((fn) => fn(this.target));
  }

  /**
   * 登録されたハンドラを削除します
   */
  public unregisterAll() {
    this.handlers.length = 0;
  }
}

/**
 * <T>型のオブジェクトのイベント発火を管理する
 */
export class EventTrigger<S> {
  /**
   * イベント発火時にコールするハンドラ群
   */
  protected readonly handlers: ((e: S) => void)[] = [];

  /**
   * イベント発火待ちの監視対象リスト
   */
  protected readonly queue: S[] = [];

  /**
   * 追跡対象
   */
  protected readonly trackers: Tracker<S>[] = [];

  /**
   * 指定した関数をイベントリスナとして追加します
   * @param fn
   */
  public register(fn: (e: S) => void) {
    this.handlers.push(fn);
  }

  /**
   * 指定されたオブジェクトを監視対象に追加します。
   * ここで追加されたオブジェクトはイベント発火後に監視対象から外されます
   * @param obj
   */
  public add(obj: S) {
    this.queue.push(obj);
  }

  /**
   * 追跡対象を追加します
   * @param tracker
   */
  public track(tracker: Tracker<S>) {
    this.trackers.push(tracker);
  }

  protected _fireToTracker(target: S) {
    this.trackers.filter((t) => t.target === target).forEach((t) => t.fire());
  }

  /**
   * キューに溜まったオブジェクトに対してイベントを発火させ、ハンドラを実行します.
   * 追跡対象のトラッカーハンドラも実行されます
   */
  public fire(): void;

  /**
   * 特定のオブジェクトに対してのみイベントを発火させます (オブジェクトはキューから取り除かれます)
   * @param target
   */
  public fire(target: S): void;

  public fire(target?: S) {
    if (target) {
      this._fireToTracker(target);
      const result = removeIf(this.queue, target);
      if (result) {
        this.handlers.forEach((fn) => fn(target));
      }
    } else {
      let obj = this.queue.shift();
      while (obj !== undefined) {
        this.handlers.forEach((fn) => fn(obj));
        this._fireToTracker(obj);
        obj = this.queue.shift();
      }
    }
  }

  /**
   * add したオブジェクトを、イベントを発火させずにすべて削除します
   */
  public flush() {
    this.queue.length = 0;
  }

  /**
   * register したリスナを削除します
   */
  public unregisterAll() {
    this.handlers.length = 0;
    this.trackers.length = 0;
  }
}

export type Mapper<S> = { [index: number]: EventTrigger<S> };

const each = <S>(mapper: Mapper<S>, fn: (t: EventTrigger<S>) => void) =>
  Object.keys(mapper)
    .map((key) => mapper[parseInt(key, 10)])
    .forEach((t) => fn(t));

export class TriggerContainer<T extends number, S> {
  protected readonly mapper: Mapper<S> = {};

  /**
   * 指定されたイベントが発火されたとき動作するトリガを返します
   * @param eventType
   */
  public find(eventType: T): EventTrigger<S> {
    if (!(eventType in this.mapper)) {
      this.mapper[eventType] = new EventTrigger<S>();
    }
    return this.mapper[eventType];
  }

  /**
   * 指定されたオブジェクトを監視対象に追加します
   * @param eventType
   * @param subject
   */
  public add(eventType: T, subject: S) {
    this.find(eventType).add(subject);
  }

  /**
   * 指定されたオブジェクトで指定されたイベントが発生したとき、トラッカーのハンドラをコールするようにします
   * @param eventType
   * @param tracker
   */
  public track(eventType: T, tracker: Tracker<S>) {
    this.find(eventType).track(tracker);
  }

  /**
   * 指定されたイベントを発火させます
   * @param eventType
   */
  public fire(eventType: T): void;
  /**
   * 指定されたイベントを指定されたのオブジェクトに対してのみ発火します
   * @param eventType
   * @param target
   */
  public fire(eventType: T, target: S): void;

  public fire(eventType: T, target?: S) {
    this.find(eventType).fire(target);
  }

  /**
   * すべての監視対象を削除します
   */
  public flush() {
    each(this.mapper, (t) => t.flush());
  }

  /**
   * すべてのイベントに登録されたイベントハンドラを削除します
   */
  public unregisterAll() {
    each(this.mapper, (t) => t.unregisterAll());
  }
}

export class ModelListener<T extends number> {
  /**
   * クラス名をキーとするトリガ管理群
   */
  protected readonly mapper: {
    [index: string]: TriggerContainer<T, any>;
  } = {};

  protected _find<S>(key: string) {
    if (!(key in this.mapper)) {
      this.mapper[key] = new TriggerContainer<T, S>();
    }
    return this.mapper[key];
  }

  /**
   * 指定された cls インスタンスで EventType が発火した際コールされるイベントハンドラを返します
   * @param eventType
   * @param cls
   */
  public find<S extends new (...args: any[]) => any>(
    eventType: T,
    cls: S
  ): EventTrigger<InstanceType<S>> {
    return this._find<S>(cls.name).find(eventType);
  }

  /**
   * 指定されたオブジェクトを指定されたイベントで発火待ちにする
   * @param eventType
   * @param subject
   */
  public add<S>(eventType: T, subject: S) {
    this._find<S>(subject.constructor.name).add(eventType, subject);
  }

  /**
   * 指定されたオブジェクトを追跡対象とします
   * @param eventType
   * @param tracker
   */
  public track<S>(eventType: T, tracker: Tracker<S>) {
    this._find<S>(tracker.target.constructor.name).track(eventType, tracker);
  }

  /**
   * 指定されたイベントを発火します。オブジェクトが指定された場合、そのオブジェクトに対してのみ発火します
   * @param eventType
   * @param subject
   */
  public fire<S>(eventType: T, subject?: S) {
    if (subject) {
      this._find(subject.constructor.name).fire(eventType, subject);
    } else
      Object.keys(this.mapper).forEach((key) =>
        this.mapper[key].fire(eventType)
      );
  }

  protected foreach(fn: (t: TriggerContainer<T, any>) => void) {
    Object.keys(this.mapper).forEach((key) => fn(this.mapper[key]));
  }

  /**
   * 登録されているイベントハンドラをすべて削除します
   */
  public unregisterAll() {
    this.foreach((t) => t.unregisterAll());
  }

  /**
   * 監視対象のオブジェクトをすべて監視対象外にします
   */
  public flush() {
    this.foreach((t) => t.flush());
  }
}

const modelListener = new ModelListener<EventType>();

export default modelListener;
