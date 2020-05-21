import modelListener, { EventType } from "../models/listener";
import { RPGAtsumaruWindow } from "../parameterObject";
import scorer from "./scorer";
import { CommuteEvent } from "./statics";

declare const window: RPGAtsumaruWindow;

const toMessage = (score: number, commuter: number) => ({
  tweetText: `私は ${commuter} 人の通勤客を電車で運びました。(SCORE: ${score}) #出勤のお時間です！`,
});

const tweet = {
  _commuter: [] as CommuteEvent[],
  init: (isAtsumaru: boolean) => {
    if (isAtsumaru) {
      scorer.register((v) => {
        window.RPGAtsumaru.screenshot.setTweetMessage(
          toMessage(v, tweet._commuter.length)
        );
      });
      modelListener.find(EventType.CREATED, CommuteEvent).register((e) => {
        tweet._commuter.push(e);
        window.RPGAtsumaru.screenshot.setTweetMessage(
          toMessage(scorer.get(), tweet._commuter.length)
        );
      });
    }
  },
  reset: () => {
    tweet._commuter.length = 0;
  },
};

export default tweet;
