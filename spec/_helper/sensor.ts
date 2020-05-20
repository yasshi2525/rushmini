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
