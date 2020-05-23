import { find } from "../utils/common";
import random from "../utils/random";
import ticker from "../utils/ticker";
import Company from "./company";
import modelListener, { EventType } from "./listener";
import Point, { distance } from "./point";
import { Pointable } from "./pointable";
import Residence from "./residence";

enum Chunk {
  NE,
  NW,
  SE,
  SW,
}

const RESIDENCES = [Chunk.NW, Chunk.SW, Chunk.NE, Chunk.SE];
const COMPANIES = [Chunk.SE];
const MAXTRY = 50;

type SizeOption = { w: number; h: number; pad: number };

/**
 * チャンクサイズを求める
 * @param opts
 */
const toSize = (opts: SizeOption) =>
  new Point((opts.w - opts.pad * 2) / 2, (opts.h - opts.pad * 2) / 2);

type CenterOption = SizeOption & { ch: Chunk };

/**
 * チャンクの中心座標を求める
 * @param opts
 */
const toCenter = (opts: CenterOption) => {
  const size = toSize(opts);
  let dx = 0;
  let dy = 0;
  switch (opts.ch) {
    case Chunk.NE:
    case Chunk.SE:
      dx = size.x / 2;
      break;
    case Chunk.NW:
    case Chunk.SW:
      dx = -size.x / 2;
      break;
  }
  switch (opts.ch) {
    case Chunk.NE:
    case Chunk.NW:
      dy = -size.y / 2;
      break;
    case Chunk.SE:
    case Chunk.SW:
      dy = size.y / 2;
      break;
  }
  return new Point(opts.w / 2 + dx, opts.h / 2 + dy);
};

type RandOption = CenterOption & { rand: (min: number, max: number) => number };

/**
 * チャンク内のランダムな点を返す
 * @param opts
 */
const toRand = (opts: RandOption) => {
  const center = toCenter(opts);
  const size = toSize(opts);
  return new Point(
    center.x + opts.rand(-size.x / 2, size.x / 2),
    center.y + opts.rand(-size.y / 2, size.y / 2)
  );
};

type AreaOption = RandOption & { others: Pointable[]; dist: number };

/**
 * チャンク内のランダムな位置で、他と一定距離離れた点を返す
 * @param opts
 */
const toAreaRand = (opts: AreaOption) => {
  let pos: Point;
  let i = 0;
  do {
    pos = toRand(opts);
    i++;
  } while (
    find(opts.others, (o) => distance(o.loc(), pos) < opts.dist) &&
    i < MAXTRY // 無限ループ防止
  );
  return pos;
};

export class CityResource {
  /**
   * 建物は最低この距離間をおいて建設する
   */
  public static AREA: number = 100;
  public static PADDING: number = 70;

  private width: number;
  private height: number;
  private rand: (min: number, max: number) => number;

  public readonly cs: Company[];
  public readonly rs: Residence[];
  private readonly buildings: Pointable[];

  /**
   * 住宅を自動配置する地点
   */
  private rsPos: Point[];

  constructor() {
    this.cs = [];
    this.rs = [];
    this.buildings = [];
  }

  public init(
    width: number,
    height: number,
    rand: (min: number, max: number) => number
  ) {
    this.width = width;
    this.height = height;
    this.rand = rand;

    // 初期会社
    const c0 = new Company(
      2,
      width - CityResource.PADDING,
      height - CityResource.PADDING
    );
    this.cs.push(c0);
    this.buildings.push(c0);

    // 追加会社
    COMPANIES.forEach((ch, idx) => {
      const pos = toAreaRand({
        ch,
        w: width,
        h: height,
        pad: CityResource.PADDING,
        dist: CityResource.AREA,
        rand,
        others: this.buildings,
      });
      const c = new Company(idx + 1, pos.x, pos.y);
      this.cs.push(c);
      this.buildings.push(c);
    });

    // 初期住宅
    const r = new Residence(
      this.cs,
      CityResource.PADDING,
      CityResource.PADDING,
      rand
    );
    this.rs.push(r);
    this.buildings.push(r);
    // 住宅の配置場所は予め決める。人の生成後だと乱数がずれ、人によって違う場所に生成されるため
    this.rsPos = RESIDENCES.map((ch) =>
      toAreaRand({
        ch,
        w: this.width,
        h: this.height,
        pad: CityResource.PADDING,
        dist: CityResource.AREA,
        rand: this.rand,
        others: this.buildings,
      })
    );

    modelListener.fire(EventType.CREATED);
  }

  public residence(x?: number, y?: number) {
    if (x === undefined || y === undefined) {
      // 追加住宅
      const pos =
        this.rsPos.shift() ??
        toAreaRand({
          ch: undefined,
          w: this.width,
          h: this.height,
          pad: CityResource.PADDING,
          dist: CityResource.AREA,
          rand: this.rand,
          others: this.buildings,
        });
      const r = new Residence(this.cs, pos.x, pos.y, this.rand);
      this.rs.push(r);
      this.buildings.push(r);
    } else {
      this.buildings.push(new Residence(this.cs, x, y, this.rand));
    }
    modelListener.fire(EventType.CREATED);
  }

  public reset() {
    this.cs.length = 0;
    this.rs.length = 0;
    this.buildings.length = 0;
  }
}

const cityResource = new CityResource();

export default cityResource;
