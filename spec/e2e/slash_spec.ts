import userResource, { ModelState } from "models/user_resource";

import {
  Record,
  resetGame,
  startGame,
  writeReport,
  writeScreenShot,
} from "../_helper/e2e";

const start = { x: 150, y: 150 };
const edge = { x: 400, y: 250 };

const pos = (ratio: number) => ({
  x: ratio * edge.x,
  y: ratio * edge.y,
});

const nModel = () => {
  const scene = g.game.scene();
  const sensor = scene.children[4];
  sensor.pointDown.fire({
    local: false,
    player: { id: "dummyPlayerID", name: "test" },
    point: start,
    type: g.EventType.PointDown,
    priority: 2,
    pointerId: 1,
    target: sensor,
  });
  g.game.tick(true);
  expect(userResource.getState()).toEqual(ModelState.STARTED);

  for (let i = 0; i <= 1; i += 0.05) {
    sensor.pointMove.fire({
      local: false,
      player: { id: "dummyPlayerID", name: "test" },
      point: start,
      startDelta: pos(i),
      prevDelta: pos(i),
      type: g.EventType.PointMove,
      priority: 2,
      pointerId: 1,
      target: sensor,
    });
    g.game.tick(true);
  }
  sensor.pointUp.fire({
    local: false,
    player: { id: "dummyPlayerID", name: "test" },
    point: start,
    startDelta: pos(1),
    prevDelta: pos(1),
    type: g.EventType.PointUp,
    priority: 2,
    pointerId: 1,
    target: sensor,
  });
  g.game.tick(true);
  expect(userResource.getState()).toEqual(ModelState.FIXED);
};

describe("[e2e] slash model", () => {
  let csv: Record[];
  let sig: boolean;

  beforeEach(() => {
    csv = [];
    sig = false;
    startGame(csv, () => (sig = true));
    nModel();
  });

  afterEach(async () => {
    await writeScreenShot("slash");
    await writeReport("slash", csv);
    resetGame();
  });

  it("normal", () => {
    do {
      g.game.tick(true);
    } while (!sig);
  });
});
