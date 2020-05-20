import userResource, { ModelState } from "models/user_resource";
import viewer, { ViewerType } from "utils/viewer";

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

export type Point = { x: number; y: number };

const div = (d: number, prev: Point, next: Point) => ({
  x: (1 - d) * prev.x + d * next.x,
  y: (1 - d) * prev.y + d * next.y,
});

const diff = (to: Point, from: Point) => ({
  x: to.x - from.x,
  y: to.y - from.y,
});

export const drag = (pivots: Point[], sensor: g.E) => {
  const path = [...pivots];
  const start = path[0];
  pointDown(sensor, start);
  g.game.tick(true);
  expect(userResource.getState()).toEqual(ModelState.STARTED);

  for (let idx = 1; idx < pivots.length; idx++) {
    for (let i = 0; i <= 1; i += 0.05) {
      pointMove(sensor, start, diff(div(i, path[idx - 1], path[idx]), start));
      g.game.tick(true);
    }
  }

  pointUp(sensor, start, diff(path[path.length - 1], start));
  g.game.tick(true);
  expect(userResource.getState()).toEqual(ModelState.FIXED);
};

export const onStation = (pos: Point) => {
  const sensor = viewer.viewers[ViewerType.STATION_BUILDER];
  pointUp(sensor, pos, { x: 0, y: 0 });
};

export const onResidence = (pos: Point) => {
  const sensor = viewer.viewers[ViewerType.RESIDENCE_BUILDER];
  pointUp(sensor, pos, { x: 0, y: 0 });
};
