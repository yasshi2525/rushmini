import Human from "../models/human";
import modelListener, { EventType } from "../models/listener";
import { Pointable } from "../models/pointable";

export type ScoreStorage = { score: number };
let _storage: ScoreStorage;

export class ScoreEvent implements Pointable {
  public readonly value: number;
  public readonly src: Human;
  constructor(value: number, src: Human) {
    this.value = value;
    this.src = src;
  }
  public loc() {
    return this.src.loc();
  }
}

export type ScoreListener = (score: number) => void;

const _listeners: ScoreListener[] = [];

const scorer = {
  init: (gameState: ScoreStorage) => {
    _storage = gameState;
    modelListener
      .find(EventType.CREATED, ScoreEvent)
      .register((ev: ScoreEvent) => scorer.add(Math.floor(ev.value)));
  },
  get: () => _storage.score,
  add: (v: number) => {
    _storage.score += v;
    if (_storage.score <= 0) {
      _storage.score = 0;
    }
    // 得点ラベルなどに得点の変化があったことを通知する
    _listeners.forEach((ev) => ev(scorer.get()));
  },
  register: (listener: ScoreListener) => {
    _listeners.push(listener);
  },
  reset: () => {
    _storage.score = 0;
    _listeners.length = 0;
  },
};

export default scorer;
