import { TriggerContainer } from "../models/listener";

const defaultTotalSec = 120;
const endingSec = 10;

let _fps = 30;
let _initialRemainFrame = defaultTotalSec * _fps;
let _remainFrame = _initialRemainFrame;

export enum EventType {
  /**
   * 1 frame ゲームが進行した際、発火されるイベント
   */
  TICKED,
  /**
   * ゲーム中で、残り時間が変化した際、発火されるイベント
   */
  SECOND,
  /**
   * ゲーム時間を使い切った際、発火されるイベント
   */
  OVER,
  /**
   * エンディングの時間も使い切った際、発火されるイベント
   */
  EXIPRED,
}

const _triggers = new TriggerContainer<EventType, number>();

const _scenes: { scene: g.Scene; fn: () => void }[] = [];

const tick = () => {
  _remainFrame--;
  _triggers.add(EventType.TICKED, _remainFrame);
  _triggers.fire(EventType.TICKED);
};

/**
 * 残り秒数が変化した際、リスナに通知する
 */
const fireChangeSecond = (prev: number, current: number) => {
  if (prev !== current) {
    _triggers.add(EventType.SECOND, current);
    _triggers.fire(EventType.SECOND);
  }
};

/**
 * ゲームオーバーになった場合、リスナに通知する
 */
const fireGameOver = () => {
  if (_remainFrame === endingSec * _fps) {
    _triggers.add(EventType.OVER, 0);
    _triggers.fire(EventType.OVER);
  }
};

const fireExpire = () => {
  if (_remainFrame === 0) {
    _triggers.add(EventType.EXIPRED, 0);
    _triggers.fire(EventType.EXIPRED);
  }
};

const ticker = {
  /**
   * ニコニコ新市場のゲーム時間を制限時間にする
   */
  init: (fps: number, val?: number) => {
    _fps = fps;
    _initialRemainFrame = (val ? val : defaultTotalSec) * _fps;
    _remainFrame = _initialRemainFrame;
  },

  /**
   * 残りゲーム時間を秒単位で返す
   */
  getRemainGameTime: () => {
    const remain = Math.floor(_remainFrame / _fps) - endingSec;
    return Math.max(remain, 0);
  },

  getCurrentFrame: () => _initialRemainFrame - _remainFrame,

  step: () => {
    if (_remainFrame > 0) {
      const prev = ticker.getRemainGameTime();
      tick();
      const current = ticker.getRemainGameTime();
      fireChangeSecond(prev, current);
      fireGameOver();
      fireExpire();
    }
  },

  /**
   * シーンの描画が更新される度に残りフレームを減らすようにする
   */
  register: (scene: g.Scene) => {
    const fn = () => {
      ticker.step();
    };
    scene.update.add(fn);
    _scenes.push({ scene, fn });
  },

  /**
   * イベントハンドラの登録を受け付ける
   */
  triggers: _triggers,

  /**
   * 制限時間を使い切ったか判定する
   */
  isExpired: () => _remainFrame <= 0,

  fps: () => _fps,

  reset: () => {
    _remainFrame = _initialRemainFrame;
    _triggers.flush();
    _triggers.unregisterAll();
    _scenes.length = 0;
  },
};

export default ticker;
