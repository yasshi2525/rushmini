import { resolve } from "dns";
import {
  exists,
  existsSync,
  fstat,
  mkdir,
  open,
  opendir,
  readFileSync,
  writeFile,
} from "fs";

import { main } from "main";
import cityResource from "models/city_resource";
import modelListener from "models/listener";
import userResource from "models/user_resource";
import random from "utils/random";
import routeFinder from "utils/route_finder";
import scenes from "utils/scene";
import scorer from "utils/scorer";
import statics from "utils/statics";
import stepper from "utils/stepper";
import ticker, { EventType } from "utils/ticker";
import transportFinder from "utils/transport_finder";
import viewer, { ViewerType } from "utils/viewer";

export type Record = {
  [index: string]: number | string;
  model: string;
  bonuses: string;
  time: number;
  score: number;
};

const toRecordHeader = (r: Record) => Object.keys(r).join(",");
const toRecordString = (r: Record) =>
  Object.keys(r)
    .map((k) => r[k])
    .join(",");

const dump = (
  to: Record,
  from: { [index: string]: number },
  prefix: string
) => {
  Object.entries(from).forEach(([k, v]) => (to[prefix + k] = v));
};

const createRecord = (model: string, bonuses: string, time: number): Record => {
  const obj: Record = {
    model,
    bonuses,
    time,
    score: scorer.get(),
  };
  const dy = statics.collect();
  obj[`allSpawn`] = statics.numSpawn;
  dump(obj, statics.numResource, "num_");
  obj[`num_commuter`] = dy.numCommuter;
  dump(obj, dy.human, "num_");
  dump(obj, dy.crowd, "rate_");
  obj[`commute_time`] = dy.commuteTime;
  dump(obj, dy.wait, "wait_");
  dump(obj, dy.die, "died_");
  return obj;
};

export const startGame = (
  model: string,
  suffix: string,
  table: Record[],
  onGameOver: () => void
) => {
  main({
    isAtsumaru: false,
    random: new g.XorshiftRandomGenerator(0),
    sessionParameter: {
      totalTimeLimit: 120,
    },
  });
  expect(ticker.getRemainGameTime()).toEqual(110);
  expect(random.random().seed).toEqual(0);
  expect(scorer.get()).toEqual(0);
  const total = ticker.getRemainGameTime();
  expect(total).toEqual(110);
  ticker.triggers.find(EventType.SECOND).register((t) => {
    if (t % 5 === 0) {
      table.push(createRecord(model, suffix, total - t));
    }
  });
  ticker.triggers.find(EventType.OVER).register(() => onGameOver());
  g.game.tick(false);
  g.game.scene().children[0].pointUp.fire();
  g.game.tick(false);
  table.push(createRecord(model, suffix, 0));
};

export const pointDown = (sensor: g.E, pos: g.CommonOffset) => {
  sensor.pointDown.fire({
    local: false,
    player: { id: "dummyPlayerID", name: "test" },
    point: pos,
    type: g.EventType.PointDown,
    priority: 2,
    pointerId: 1,
    target: sensor,
  });
};

export const pointMove = (
  sensor: g.E,
  pos: g.CommonOffset,
  delta: g.CommonOffset
) => {
  sensor.pointMove.fire({
    local: false,
    player: { id: "dummyPlayerID", name: "test" },
    point: pos,
    startDelta: delta,
    prevDelta: delta,
    type: g.EventType.PointMove,
    priority: 2,
    pointerId: 1,
    target: sensor,
  });
};

export const pointUp = (
  sensor: g.E,
  pos: g.CommonOffset,
  delta: g.CommonOffset
) => {
  sensor.pointUp.fire({
    local: false,
    player: { id: "dummyPlayerID", name: "test" },
    point: pos,
    startDelta: delta,
    prevDelta: delta,
    type: g.EventType.PointUp,
    priority: 2,
    pointerId: 1,
    target: sensor,
  });
};

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

export const BONUS_SET: BONUS_TYPE[][] = [];

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
          !BONUS_SET.some((bonues) => {
            if (result.length !== bonues.length) return false;
            for (let i = 0; i < bonues.length; i++) {
              if (result[i] !== bonues[i]) return false;
            }
            return true;
          })
        ) {
          BONUS_SET.push(result);
        }
      }
    }
  }
}

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

export const handleBonus = (
  handlers: { key: BONUS_TYPE; fn: () => void }[]
) => {
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

export const resetGame = () => {
  scenes.reset();
  viewer.reset();
  transportFinder.reset();
  routeFinder.reset();
  stepper.reset();
  statics.reset();
  userResource.reset();
  cityResource.reset();
  modelListener.unregisterAll();
  modelListener.flush();
  ticker.reset();
  scorer.reset();
  scorer.init(g.game.vars.gameState);
};

const mkDirIf = async (name: string) => {
  const ex = await new Promise<boolean>((resolve) => {
    exists(`report/${name}`, (ex) => resolve(ex));
  });
  if (!ex) {
    await new Promise((resolve) => {
      mkdir(`report/${name}`, { recursive: true }, () => resolve());
    });
  }
};

const writeWrapper = (fd: number, str: string, mode: string) =>
  new Promise((resolve, reject) => {
    writeFile(fd, str + "\n", { mode }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

const openWrapper = (name: string, mode: string) =>
  new Promise<number>((resolve, reject) => {
    open(name, mode, (err, fd) => {
      if (err) reject(err);
      resolve(fd);
    });
  });

const writeReport = async (model: string, suffix: string, table: Record[]) => {
  await mkDirIf(model);
  const fd_detail = await openWrapper(
    `report/${model}/${model}_${suffix}.csv`,
    "w"
  );
  await writeWrapper(fd_detail, toRecordHeader(table[0]), "w");
  for (let record of table)
    await writeWrapper(fd_detail, toRecordString(record), "a");

  const summary = table[table.length - 1];
  if (!existsSync(`report/${model}.csv`)) {
    const fd_total_make = await openWrapper(`report/${model}.csv`, "w");
    await writeWrapper(fd_total_make, toRecordHeader(summary), "w");
  }
  const fd_total = await openWrapper(`report/${model}.csv`, "a");
  await writeWrapper(fd_total, toRecordString(summary), "a");
};

const screenshot = () => {
  const currentScene = g.game.scene();
  const sprite = g.Util.createSpriteFromScene(currentScene, currentScene);
  const imageData = sprite.surface
    .renderer()
    ._getImageData(0, 0, sprite.width, sprite.height);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  context.putImageData(imageData, 0, 0);
  const encoded = canvas
    .toDataURL("image/png")
    .replace(/^data:image\/png;base64,/, "");
  sprite.destroy(true);
  return encoded;
};

const writeScreenShot = async (model: string, suffix: string) => {
  await mkDirIf(model);
  const fd = await openWrapper(`report/${model}/${model}_${suffix}.png`, "w");
  await new Promise((resolve, reject) => {
    writeFile(fd, screenshot(), "base64", (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

export const output = async (model: string, suffix: string, data: Record[]) => {
  await writeScreenShot(model, suffix);
  await writeReport(model, suffix, data);
};
