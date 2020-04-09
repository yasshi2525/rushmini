import Platform from "./platform";
import Gate from "./gate";
import modelListener from "./listener";

class Station {
    public readonly platforms: Platform[];
    public readonly gate: Gate;

    constructor() {
        this.platforms = [];
        this.gate = new Gate(this);
        modelListener.station.add(this);
    }

    public getPos(): { readonly x: number, readonly y: number } {
        const center = { x: 0, y: 0 };
        this.platforms.forEach(p => {
            center.x += p.on.x;
            center.y += p.on.y;
        })
        return center;
    }
}

export default Station;