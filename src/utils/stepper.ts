import Gate from "../models/gate";
import Human from "../models/human";
import listener, { EventType as Ev } from "../models/listener";
import Residence from "../models/residence";

const rs: Residence[] = [];
const gs: Gate[] = [];
const hs: Human[] = [];

const stepper = {
  init: () => {
    listener.find(Ev.CREATED, Residence).register((r) => rs.push(r));
    listener.find(Ev.CREATED, Gate).register((g) => gs.push(g));
    listener.find(Ev.CREATED, Human).register((h) => hs.push(h));
  },

  step: () => {
    rs.forEach((r) => r._step());
    gs.forEach((g) => g._step());
    hs.forEach((h) => h._step());
    listener.fire(Ev.CREATED);
    listener.fire(Ev.MODIFIED);
  },

  reset: () => {
    rs.length = 0;
    gs.length = 0;
    hs.length = 0;
  },
};

export default stepper;
