import viewer, { ViewerType } from "utils/viewer";

import { createHandler } from "./bonus";
import { Point, drag, onResidence, onStation } from "./sensor";

const genLong = function* () {
  for (let x = 0; x < 5; x++) {
    for (let y = 0; y < 5; y++) {
      yield { x: 150 + x * 100, y: 150 + y * 50 };
    }
  }
};

const main = Array.from(genLong());
const branch: Point[] = [
  { x: 500, y: 250 },
  { x: 220, y: 250 },
];

const onBranch = () => {
  const sensor = viewer.viewers[ViewerType.BRANCH_BUILDER];
  expect(sensor.visible()).toBeTruthy();
  drag(branch, sensor);
};

export const buildLongModel = () => {
  const sensor = viewer.viewers[ViewerType.BUILDER];
  drag(main, sensor);
  return createHandler({
    onBranch,
    onStation: () => onStation({ x: 200, y: 250 }),
    onResidence: () => onResidence({ x: 0, y: 0 }),
  });
};
