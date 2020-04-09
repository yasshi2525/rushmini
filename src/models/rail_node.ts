import RailEdge from "./rail_edge";
import Station from "./station";
import Platform from "./platform";
import modelListener from "./listener";

class RailNode {
    public readonly x: number;
    public readonly y: number;
    public readonly out: RailEdge[];
    public readonly in: RailEdge[];
    public platform?: Platform;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.out = [];
        this.in = [];
        modelListener.railNode.add(this);
    }

    /**
     * 指定された地点に線路を伸ばす
     * @param x 
     * @param y 
     */
    public extend(x: number, y: number) {
        const tail = new RailNode(x, y);
        const outE = new RailEdge(this, tail);
        const inE = new RailEdge(tail, this);
        outE.reverse = inE;
        inE.reverse = outE;
        return outE;
    }

    /**
     * 駅を建設します
     */
    public buildStation() {
        if (this.platform) {
            console.warn("try to build station on already deployed");
            return this.platform;
        }
        return new Platform(this, new Station());
    }
}

export default RailNode;