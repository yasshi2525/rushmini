import { exists, existsSync, mkdir, open, writeFile } from "fs";

import { Record, toRecordHeader, toRecordString } from "./record";

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
