import Company from "../models/company";
import DeptTask from "../models/dept_task";
import Gate from "../models/gate";
import Human, { HumanState } from "../models/human";
import modelListener, { EventType } from "../models/listener";
import MoveTask from "../models/move_task";
import Platform from "../models/platform";
import RailEdge from "../models/rail_edge";
import RailLine from "../models/rail_line";
import RailNode from "../models/rail_node";
import Residence from "../models/residence";
import Station from "../models/station";
import Train from "../models/train";
import { remove, sum } from "./common";
import ticker from "./ticker";

let resourceTypes: any[] = [];

export type ResourceSet<T> = { [index: string]: T };
export type StateStatics = { [key in HumanState]: number };
export type CrowdStatics = { [index: string]: number };

export type DynamicStatics = {
  human: StateStatics;
  crowd: CrowdStatics;
  wait: StateStatics;
  die: StateStatics;
  numCommuter: number;
  commuteTime: number;
};

export class WaitEvent {
  state: HumanState;
  value: number;
  constructor(state: HumanState) {
    this.state = state;
    this.value = 0;
  }
  public wait() {
    this.value++;
  }
  public fire() {
    modelListener.add(EventType.CREATED, this);
  }
}

/**
 * 電車に乗って通勤しきったときに発生
 */
export class CommuteEvent {
  value: number;
  constructor(value: number) {
    this.value = value;
  }
}

export class DieEvent {
  cause: HumanState;
  constructor(cause: HumanState) {
    this.cause = cause;
  }
}

export type Controller = {
  _objs: ResourceSet<Array<any>>;
  numResource: ResourceSet<number>;
  numSpawn: number;
  _commute: CommuteEvent[];
  _wait: WaitEvent[];
  _die: DieEvent[];
  init: () => void;
  collect: () => DynamicStatics;
  reset: () => void;
};

const emptyState = () => {
  const obj: Partial<StateStatics> = {};
  Object.keys(HumanState).forEach(
    (k: keyof typeof HumanState) => (obj[HumanState[k]] = 0)
  );
  return obj as StateStatics;
};

const emptySet = <T>(init: T) => {
  const obj: ResourceSet<T> = {};
  resourceTypes.forEach((cls) => {
    if (init instanceof Array) {
      obj[cls.name] = init.slice(0, init.length) as any;
    } else {
      obj[cls.name] = init;
    }
  });
  return obj;
};

const findArray = <T>(
  obj: { [index: string]: any },
  cls: new (...args: any[]) => T
) => (obj[cls.name] ?? []) as T[];

const rate = <T>(arr: T[], num: (e: T) => number, cap: number) => {
  if (arr === undefined || arr.length === 0) return 0;
  return sum(arr, num) / arr.length / cap;
};

const statics: Controller = {
  _objs: {},
  numResource: {},
  numSpawn: 0,
  _commute: [],
  _wait: [],
  _die: [],
  init: () => {
    // ここで作らないと一部クラスが Undefined になる
    resourceTypes = [
      Company,
      Residence,
      RailNode,
      RailEdge,
      Station,
      Platform,
      Gate,
      RailLine,
      DeptTask,
      MoveTask,
      Train,
      Human,
    ];
    statics._objs = emptySet([]);
    statics.numResource = emptySet(0);
    resourceTypes.forEach((cls) => {
      modelListener.find(EventType.CREATED, cls).register((e) => {
        if (e instanceof Human) statics.numSpawn++;
        const key = e.constructor.name;
        statics.numResource[key]++;
        statics._objs[key].push(e);
      });
      modelListener.find(EventType.DELETED, cls).register((e) => {
        const key = e.constructor.name;
        statics.numResource[key]--;
        remove(statics._objs[key], e);
      });
    });
    modelListener
      .find(EventType.CREATED, WaitEvent)
      .register((e) => statics._wait.push(e));
    modelListener
      .find(EventType.CREATED, DieEvent)
      .register((e) => statics._die.push(e));
    modelListener
      .find(EventType.CREATED, CommuteEvent)
      .register((e) => statics._commute.push(e));
  },
  collect: () => {
    const obj = {
      human: emptyState(),
      resource: emptySet(0),
      crowd: {
        Gate: rate(
          findArray(statics._objs, Gate),
          (g) => g._concourse.length,
          Gate.CAPACITY
        ),
        Platform: rate(
          findArray(statics._objs, Platform),
          (p) => p.numUsed(),
          Platform.CAPACITY
        ),
        Train: rate(
          findArray(statics._objs, Train),
          (t) => t.passengers.length,
          Train.CAPACITY
        ),
      },
      wait: emptyState(),
      die: emptyState(),
      numCommuter: statics._commute.length,
      commuteTime:
        statics._commute.length > 0
          ? sum(statics._commute, (e) => e.value) /
            statics._commute.length /
            ticker.fps()
          : 0,
    };
    findArray(statics._objs, Human).forEach((h) => obj.human[h.state()]++);
    Object.keys(HumanState).forEach((k: keyof typeof HumanState) => {
      const state = HumanState[k];
      const ws = statics._wait.filter((w) => w.state === state);
      obj.wait[state] =
        ws.length > 0 ? sum(ws, (w) => w.value) / ws.length / ticker.fps() : 0;
      obj.die[state] = statics._die.filter((d) => d.cause === state).length;
    });
    statics._wait.length = 0;
    return obj;
  },
  reset: () => {
    statics._objs = emptySet([]);
    statics.numSpawn = 0;
    statics.numResource = emptySet(0);
    statics._commute.length = 0;
    statics._die.length = 0;
    statics._wait.length = 0;
  },
};

export default statics;
