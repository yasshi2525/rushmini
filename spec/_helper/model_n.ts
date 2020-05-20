import viewer, { ViewerType } from "utils/viewer";

import { createHandler } from "./bonus";
import { Point, drag, onResidence, onStation } from "./sensor";

const main: Point[] = [
  { x: 150, y: 150 },
  { x: 150, y: 350 },
  { x: 550, y: 150 },
  { x: 550, y: 350 },
];

const branch: Point[] = [
  { x: 150, y: 150 },
  { x: 500, y: 300 },
];

const onBranch = () => {
  const sensor = viewer.viewers[ViewerType.BRANCH_BUILDER];
  expect(sensor.visible()).toBeTruthy();
  drag(branch, sensor);
};

export const buildNModel = () => {
  const sensor = viewer.viewers[ViewerType.BUILDER];
  drag(main, sensor);
  return createHandler({
    onBranch,
    onStation: () => onStation({ x: 350, y: 250 }),
    onResidence: () => onResidence({ x: 0, y: 0 }),
  });
};
