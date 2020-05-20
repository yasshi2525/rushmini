import viewer, { ViewerType } from "utils/viewer";

import { createHandler } from "./bonus";
import { Point, drag, onResidence, onStation } from "./sensor";

const genCircle = function* () {
  for (let i = 0; i < 360; i += 10) {
    yield {
      x: 350 + 250 * Math.cos((i * Math.PI) / 180),
      y: 250 + 150 * Math.sin((i * Math.PI) / 180),
    } as Point;
  }
};

const main = Array.from(genCircle());
const branch: Point[] = [
  { x: 600, y: 250 },
  { x: 120, y: 250 },
];

const onBranch = () => {
  const sensor = viewer.viewers[ViewerType.BRANCH_BUILDER];
  expect(sensor.visible()).toBeTruthy();
  drag(branch, sensor);
};

export const buildCircleModel = () => {
  const sensor = viewer.viewers[ViewerType.BUILDER];
  drag(main, sensor);
  return createHandler({
    onBranch,
    onStation: () => onStation({ x: 100, y: 250 }),
    onResidence: () => onResidence({ x: 0, y: 0 }),
  });
};
