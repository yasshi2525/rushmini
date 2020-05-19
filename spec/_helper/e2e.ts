import { resolve } from "dns";
import { exists, fstat, mkdir, open, opendir, writeFile } from "fs";

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
import viewer from "utils/viewer";

export type Record = {
  [index: string]: number;
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

const createRecord = (total: number): Record => {
  const obj: Record = {
    time: total,
    score: scorer.get(),
  };
  const dy = statics.collect();
  obj[`allSpawn`] = statics.numSpawn;
  obj[`commuter`] = statics.numCommute;
  dump(obj, statics.numResource, "num_");
  dump(obj, dy.human, "num_");
  dump(obj, dy.crowd, "rate_");
  dump(obj, dy.wait, "wait_");
  dump(obj, dy.die, "died_");
  return obj;
};

export const startGame = (table: Record[], onGameOver: () => void) => {
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
      table.push(createRecord(total - t));
    }
  });
  ticker.triggers.find(EventType.OVER).register(() => onGameOver());
  g.game.tick(false);
  g.game.scene().children[0].pointUp.fire();
  g.game.tick(false);
  table.push(createRecord(0));
};

export const resetGame = () => {
  scenes.reset();
  viewer.reset();
  transportFinder.reset();
  routeFinder.reset();
  stepper.reset();
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
    exists("report", (ex) => resolve(ex));
  });
  if (!ex) {
    await new Promise((resolve) => {
      mkdir("report", () => resolve());
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

export const writeReport = async (name: string, table: Record[]) => {
  await mkDirIf(name);
  const fd = await new Promise<number>((resolve, reject) => {
    open(`report/${name}.csv`, "w", (err, fd) => {
      if (err) reject(err);
      resolve(fd);
    });
  });

  await writeWrapper(fd, toRecordHeader(table[0]), "w");

  for (let record of table) await writeWrapper(fd, toRecordString(record), "a");
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

export const writeScreenShot = async (name: string) => {
  await mkDirIf(name);
  const fd = await new Promise<number>((resolve, reject) => {
    open(`report/${name}.png`, "w", (err, fd) => {
      if (err) reject(err);
      else resolve(fd);
    });
  });
  await new Promise((resolve, reject) => {
    writeFile(fd, screenshot(), "base64", (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};
