import Station from "./station";
import modelListener from "./listener";

class Gate {
    public readonly st: Station;
    public capacity: number = 1;
    
    constructor(st: Station) {
        this.st = st;
        modelListener.gate.add(this);
    }
}

export default Gate;