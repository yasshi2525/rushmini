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

import { BONUS_TYPE, BonusHandler, handleBonus } from "./bonus";
import { output } from "./io";
import { Record, createRecord } from "./record";

const startGame = (
  model: string,
  suffix: string,
  table: Record[],
  onGameOver: () => void
) => {
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
      table.push(createRecord(model, suffix, total - t));
    }
  });
  ticker.triggers.find(EventType.OVER).register(() => onGameOver());
  g.game.tick(false);
  g.game.scene().pointUpCapture.fire();
  g.game.tick(false);
  g.game.scene().pointUpCapture.fire();
  g.game.tick(false);
  table.push(createRecord(model, suffix, 0));
};

export const resetGame = () => {
  scenes.reset();
  viewer.reset();
  transportFinder.reset();
  routeFinder.reset();
  stepper.reset();
  statics.reset();
  userResource.reset();
  cityResource.reset();
  modelListener.unregisterAll();
  modelListener.flush();
  ticker.reset();
  scorer.reset();
  scorer.init(g.game.vars.gameState);
};

const loop = (sig: () => boolean, bonus: BonusHandler[]) => {
  do {
    handleBonus(bonus);
    g.game.tick(true);
  } while (!sig());
};

type ExecOption = {
  prepare?: () => void;
  name: string;
  suffix: string;
  bonuses: BONUS_TYPE[];
  builder: () => (bonuses: BONUS_TYPE[]) => BonusHandler[];
};

export const execute = async (opts: ExecOption) => {
  const csv: Record[] = [];
  let sig = false;
  const signal = () => sig;
  if (opts.prepare) opts.prepare();
  startGame(opts.name, opts.suffix, csv, () => (sig = true));
  const handler = opts.builder();
  loop(signal, handler(opts.bonuses));
  await output(opts.name, opts.suffix, csv);
};

export const genParam = function* (min: number, max: number, step: number) {
  for (let i = min; i <= max; i += step) yield i;
};
