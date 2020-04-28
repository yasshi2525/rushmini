import { TriggerContainer } from "../models/listener";

const defaultTotalSec = 70;
const endingSec = 10;

let _fps = 30;
let _remainFrame = defaultTotalSec * _fps;

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

const ticker = {
  /**
   * ニコニコ新市場のゲーム時間を制限時間にする
   */
  init: (fps: number, val?: number) => {
    _fps = fps;
    _remainFrame = (val ? val : defaultTotalSec) * _fps;
  },

  /**
   * 残りゲーム時間を秒単位で返す
   */
  getRemainGameTime: () => {
    const remain = Math.floor(_remainFrame / _fps) - endingSec;
    return Math.max(remain, 0);
  },

  step: () => {
    if (_remainFrame > 0) {
      const oldGameTime = ticker.getRemainGameTime();
      _remainFrame--;
      _triggers.add(EventType.TICKED, _remainFrame);
      _triggers.fire(EventType.TICKED);
      const currentGameTime = ticker.getRemainGameTime();
      // 残り秒数が変化した際、リスナに通知する
      if (oldGameTime !== currentGameTime) {
        _triggers.add(EventType.SECOND, currentGameTime);
        _triggers.fire(EventType.SECOND);
      }
      // ゲームオーバーになった場合、リスナに通知する
      if (_remainFrame === endingSec * _fps) {
        _triggers.add(EventType.OVER, 0);
        _triggers.fire(EventType.OVER);
      }
      if (_remainFrame === 0) {
        _triggers.add(EventType.EXIPRED, 0);
        _triggers.fire(EventType.EXIPRED);
      }
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
    _fps = 30;
    _remainFrame = defaultTotalSec * _fps;
    _triggers.flush();
    _triggers.unregisterAll();
    _scenes.forEach((s) => s.scene.update.remove(s.fn));
    _scenes.length = 0;
  },
};

export default ticker;
