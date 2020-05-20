import userResource, { ModelState } from "models/user_resource";
import viewer, { ViewerType } from "utils/viewer";

import { createHandler } from "./bonus";
import { Point, drag, onResidence, onStation } from "./sensor";

const main: Point[] = [
  { x: 150, y: 150 },
  { x: 500, y: 400 },
  { x: 550, y: 350 },
  { x: 200, y: 150 },
];

const branch: Point[] = [
  { x: 365, y: 290 },
  { x: 165, y: 400 },
];

const onBranch = () => {
  const sensor = viewer.viewers[ViewerType.BRANCH_BUILDER];
  expect(sensor.visible()).toBeTruthy();
  drag(branch, sensor);
};

export const buildVModel = () => {
  const sensor = viewer.viewers[ViewerType.BUILDER];
  expect(sensor.visible()).toBeTruthy();
  drag(main, sensor);
  return createHandler({
    onBranch,
    onStation: () => onStation({ x: 350, y: 275 }),
    onResidence: () => onResidence({ x: 0, y: 0 }),
  });
};
