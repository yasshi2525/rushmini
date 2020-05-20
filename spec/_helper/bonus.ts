import viewer, { ViewerType } from "utils/viewer";

import { pointUp } from "./sensor";

export enum BONUS_TYPE {
  STATION = "s",
  BRANCH = "b",
  TRAIN = "t",
  RESIDENCE = "r",
}

const BONUSES = [
  undefined,
  BONUS_TYPE.STATION,
  BONUS_TYPE.BRANCH,
  BONUS_TYPE.TRAIN,
  BONUS_TYPE.RESIDENCE,
];

export const genBonus = function* () {
  const results: BONUS_TYPE[][] = [];
  for (let b1 = 0; b1 < BONUSES.length; b1++) {
    for (let b2 = 0; b2 < BONUSES.length; b2++) {
      for (let b3 = 0; b3 < BONUSES.length; b3++) {
        for (let b4 = 0; b4 < BONUSES.length; b4++) {
          const result: BONUS_TYPE[] = [];
          if (BONUSES[b1] !== undefined) result.push(BONUSES[b1]);
          if (BONUSES[b2] !== undefined && result.indexOf(BONUSES[b2]) === -1)
            result.push(BONUSES[b2]);
          if (BONUSES[b3] !== undefined && result.indexOf(BONUSES[b3]) === -1)
            result.push(BONUSES[b3]);
          if (BONUSES[b4] !== undefined && result.indexOf(BONUSES[b4]) === -1)
            result.push(BONUSES[b4]);
          if (
            !results.some((bs) => {
              if (result.length !== bs.length) return false;
              for (let i = 0; i < bs.length; i++) {
                if (result[i] !== bs[i]) return false;
              }
              return true;
            })
          ) {
            results.push(result);
            yield result;
          }
        }
      }
    }
  }
};

export const toSuffixString = (bonuses: BONUS_TYPE[]) => {
  const str: string[] = [];
  for (let i = 0; i < 4; i++) {
    if (i >= bonuses.length) {
      str.push("-");
    } else {
      switch (bonuses[i]) {
        case BONUS_TYPE.STATION:
          str.push("s");
          break;
        case BONUS_TYPE.BRANCH:
          str.push("b");
          break;
        case BONUS_TYPE.TRAIN:
          str.push("t");
          break;
        case BONUS_TYPE.RESIDENCE:
          str.push("r");
          break;
      }
    }
  }
  return str.join("");
};

export const toBonus = (str: string) =>
  str.split("").filter((s) => s != "-") as BONUS_TYPE[];

export type BonusHandler = { key: BONUS_TYPE; fn: () => void };

export const handleBonus = (handlers: BonusHandler[]) => {
  if (viewer.viewers[ViewerType.BONUS].visible()) {
    const handler = handlers.shift();
    if (handler === undefined) {
      return;
    }
    let vKey: ViewerType;
    switch (handler.key) {
      case BONUS_TYPE.STATION:
        vKey = ViewerType.BONUS_STATION;
        break;
      case BONUS_TYPE.BRANCH:
        vKey = ViewerType.BONUS_BRANCH;
        break;
      case BONUS_TYPE.TRAIN:
        vKey = ViewerType.BONUS_TRAIN;
        break;
      case BONUS_TYPE.RESIDENCE:
        vKey = ViewerType.BONUS_RESIDENCE;
        break;
    }
    pointUp(viewer.viewers[vKey].children[1], { x: 0, y: 0 }, { x: 0, y: 0 });
    g.game.tick(true);
    handler.fn();
  }
};
