import modelListener, { EventType } from "../models/listener";
import Point, { distance } from "../models/point";
import RailEdge from "../models/rail_edge";
import RailNode from "../models/rail_node";
import Station from "../models/station";
import userResource from "../models/user_resource";
import viewer, { ViewerEvent } from "../utils/viewer";
import connect from "./connector";
import { adjust } from "./creator";
import ViewObjectFactory from "./factory";
import {
  createRailEdgeCandidate,
  RailEdgeCandidateOption,
  railEdgeModifier,
} from "./rail_edge_view";
import { createSquareSprite } from "./sprite";

const SIZE = 0.8;
const SLIDE = 10;
const DIST = 20;
const BORDERS: RailEdgeCandidateOption[] = [
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

const createRailEdgePanel = (scene: g.Scene, opts: RailEdgeCandidateOption) => {
  const panel = new g.E({ scene });
  connect(
    new ViewObjectFactory<RailEdge>(panel, (s, su) =>
      adjust(s, su, createRailEdgeCandidate(opts)(s, su))
    ),
    RailEdge,
    railEdgeModifier({ band: opts.band, slide: opts.slide })
  );
  return panel;
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

const createInstraction = (scene: g.Scene) =>
  new g.SystemLabel({
    scene,
    text: "線路をクリックorタップして新駅を建設しよう",
    fontSize: 20,
    x: (g.game.width * SIZE) / 2,
    y: 20 * 2,
    textAlign: g.TextAlign.Center,
  });

const createStationBuilder = (loadedScene: g.Scene) => {
  const rns: RailNode[] = [];
  modelListener.find(EventType.CREATED, RailNode).register((r) => rns.push(r));

  const panel = new g.Pane({
    scene: loadedScene,
    x: (g.game.width * (1 - SIZE)) / 2,
    y: (g.game.height * (1 - SIZE)) / 2,
    width: g.game.width * SIZE,
    height: g.game.height * SIZE,
    touchable: true,
  });

  BORDERS.forEach((opts) =>
    panel.append(createRailEdgePanel(loadedScene, opts))
  );
  panel.append(createStationPanel(loadedScene));
  panel.append(createInstraction(loadedScene));

  panel.pointUp.add((ev) => handleOnSelected(ev, rns));

  panel.hide();
  return panel;
};

export default createStationBuilder;
