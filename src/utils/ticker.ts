const defaultTotalSec = 70;
const endingSec = 10;

let _fps = 30;
let _remainFrame = defaultTotalSec * _fps;

export type GameTimeListener = (sec: number) => void;
let _listeners: GameTimeListener[];
let _scenes: { scene: g.Scene; fn: () => void }[];

const ticker = {
  /**
   * ニコニコ新市場のゲーム時間を制限時間にする
   */
  init: (fps: number, val?: number) => {
    _fps = fps;
    _remainFrame = (val ? val : defaultTotalSec) * _fps;
    _listeners = [];
    if (_scenes) {
      _scenes.forEach((s) => s.scene.update.remove(s.fn));
    }
    _scenes = [];
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
      const currentGameTime = ticker.getRemainGameTime();
      // 残り秒数が変化した際、リスナに通知する
      if (oldGameTime !== currentGameTime) {
        _listeners.forEach((ev) => ev(currentGameTime));
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
   * 残りゲーム時間が変化した際、通知するリスナを登録する
   */
  observe: (listener: GameTimeListener) => {
    _listeners.push(listener);
  },
  /**
   * ゲーム操作終了かどうか判定する
   */
  isGameOver: () => _remainFrame <= endingSec * _fps,
  /**
   * 制限時間を使い切ったか判定する
   */
  isExpired: () => _remainFrame <= 0,
};

export default ticker;
