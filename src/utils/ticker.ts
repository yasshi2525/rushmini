const defaultTotalSec = 120;
const endingSec = 10;

let _fps = 30;
let _remainFrame = defaultTotalSec * _fps;

export type GameTimeListener = (sec: number) => void;
const _listeners: GameTimeListener[] = [];

const ticker = {
  /**
   * ニコニコ新市場のゲーム時間を制限時間にする
   */
  init: (fps: number, val?: number) => {
    _fps = fps;
    if (val) {
      _remainFrame = val * _fps;
    }
  },
  /**
   * 残りゲーム時間を秒単位で返す
   */
  getRemainGameTime: () => {
    const remain = Math.ceil(_remainFrame / _fps) - endingSec;
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
    scene.update.add(() => {
      if (scene.isCurrentScene()) {
        ticker.step();
      }
    });
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
