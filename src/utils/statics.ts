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

const resourceTypes = [
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

type ResourceSet<T> = { [index: string]: T };
type StateStatics = { [key in HumanState]: number };
type CrowdStatics = { [index: string]: number };

type DynamicStatics = {
  human: StateStatics;
  crowd: CrowdStatics;
};

type Controller = {
  _objs: ResourceSet<Array<any>>;
  numResource: ResourceSet<number>;
  numSpawn: number;
  diedIn: StateStatics;
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
) => obj[cls.name] as T[];

const rate = <T>(arr: T[], num: (e: T) => number, cap: number) => {
  if (arr.length === 0) return 0;
  return sum(arr, num) / arr.length / cap;
};

const statics: Controller = {
  _objs: emptySet([]),
  numResource: emptySet(0),
  diedIn: emptyState(),
  numSpawn: 0,
  init: () => {
    resourceTypes.forEach((cls) => {
      modelListener.find(EventType.CREATED, cls).register((e) => {
        if (e instanceof Human) statics.numSpawn++;
        const key = e.constructor.name;
        statics.numResource[key]++;
        statics._objs[key].push(e);
      });
      modelListener.find(EventType.DELETED, cls).register((e) => {
        if (e instanceof Human) statics.diedIn[e.state()]++;
        const key = e.constructor.name;
        statics.numResource[key]--;
        remove(statics._objs[key], e);
      });
    });
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
    };
    findArray(statics._objs, Human).forEach((h) => obj.human[h.state()]++);
    return obj;
  },
  reset: () => {
    statics._objs = emptySet([]);
    statics.numSpawn = 0;
    statics.numResource = emptySet(0);
    statics.diedIn = emptyState();
  },
};

export default statics;
