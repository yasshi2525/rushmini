import modelListener, { EventType } from "../models/listener";

export type ScoreStorage = { score: number };
let _storage: ScoreStorage;

export type ScoreListener = (score: number) => void;

const _listeners: ScoreListener[] = [];

const scorer = {
  init: (gameState: ScoreStorage) => {
    _storage = gameState;
    modelListener
      .find(EventType.SCORED, Number)
      .register((v: number) => scorer.add(Math.floor(v)));
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
  observe: (listener: ScoreListener) => {
    _listeners.push(listener);
  },
};

export default scorer;
