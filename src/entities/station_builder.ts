import modelListener, { EventType } from "../models/listener";
import Point, { distance } from "../models/point";
import RailEdge from "../models/rail_edge";
import RailNode from "../models/rail_node";
import Station from "../models/station";
import userResource from "../models/user_resource";
import { remove } from "../utils/common";
import viewer, { ViewerEvent } from "../utils/viewer";
import connect, { ModelModifier } from "./connector";
import { adjust } from "./creator";
import ViewObjectFactory from "./factory";
import {
  RailEdgeModuleOption,
  createRailEdgeModule,
  createRailEdgeModuleModifier,
} from "./rail_edge_view";
import { appendInstruction, createWorkingArea } from "./rectangle";
import { createSquareSprite } from "./sprite";

const SLIDE = 10;
const DIST = 20;
const BORDERS: RailEdgeModuleOption[] = [
  { band: 16, slide: SLIDE, color: "#ffffff" },
  { band: 12, slide: SLIDE, color: "#ffd700" },
  { band: 8, slide: SLIDE, color: "#ffffff" },
  { band: 4, slide: SLIDE, color: "#b8860b" },
];

const handleOnSelected = (ev: g.PointUpEvent, rns: RailNode[]) => {
  const pos = new Point(
    ev.point.x + ev.startDelta.x,
    ev.point.y + ev.startDelta.y
  );
  rns.sort((a, b) => distance(a.loc(), pos) - distance(b.loc(), pos));
  if (distance(rns[0].loc(), pos) < DIST) {
    userResource.station(rns[0]);
    viewer.fire(ViewerEvent.STATION_ENDED);
  }
};

const createRailEdgePanel = (
  scene: g.Scene,
  optsList: RailEdgeModuleOption[]
) => {
  const container = new g.E({ scene });
  optsList.forEach((opts, idx) => {
    const panel = new g.E({ scene });

    const modififer: { [key in EventType]?: ModelModifier<RailEdge> } = {};
    modififer[EventType.MODIFIED] = createRailEdgeModuleModifier(opts);
    connect(
      new ViewObjectFactory<RailEdge>(panel, (s, su) =>
        adjust(s, su, createRailEdgeModule(opts)(s, su))
      ),
      RailEdge,
      modififer
    );
    container.append(panel);
  });
  return container;
};

const createStationPanel = (scene: g.Scene) => {
  const panel = new g.E({ scene });
  connect(
    new ViewObjectFactory<Station>(panel, (sc, s) =>
      adjust(sc, s, createSquareSprite(sc, "station_basic"))
    ),
    Station
  );
  return panel;
};

const createStationBuilder = (loadedScene: g.Scene) => {
  const rns: RailNode[] = [];
  modelListener
    .find(EventType.CREATED, RailNode)
    .register((rn) => rns.push(rn));
  modelListener
    .find(EventType.DELETED, RailNode)
    .register((rn) => remove(rns, rn));

  const panel = createWorkingArea(loadedScene, {
    isPane: true,
    touchable: true,
  });

  panel.append(createRailEdgePanel(loadedScene, BORDERS));
  panel.append(createStationPanel(loadedScene));
  appendInstruction(panel, "station_txt");

  panel.pointUp.add((ev) => handleOnSelected(ev, rns));

  panel.hide();
  return panel;
};

export default createStationBuilder;
