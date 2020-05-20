import scorer from "utils/scorer";
import statics from "utils/statics";

export type Record = {
  [index: string]: number | string;
  model: string;
  bonuses: string;
  time: number;
  score: number;
};

export const toRecordHeader = (r: Record) => Object.keys(r).join(",");
export const toRecordString = (r: Record) =>
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

export const createRecord = (
  model: string,
  bonuses: string,
  time: number
): Record => {
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
