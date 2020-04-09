import RailNode from "./rail_node";
import modelListener from "./listener";

class RailEdge {
    public readonly from: RailNode;
    public readonly to: RailNode;
    public reverse?: RailEdge;

    constructor(from: RailNode, to: RailNode) {
        this.from = from;
        this.to = to;
        from.out.push(this);
        to.in.push(this);
        modelListener.railEdge.add(this);
    }

    /**
     * 線路の長さを返す
     */
    public getLength() {
        const dx = this.to.x - this.from.x;
        const dy = this.to.y - this.from.y;
        return Math.sqrt(dx * dx + dy * dy)
    }

    /**
     * 始点から終点までの角度を360°で返します
     */
    public getAngle() {
        const dx = this.to.x - this.from.x;
        const dy = this.to.y - this.from.y;
        return Math.atan2(dy, dx) * 180 / Math.PI;
    }
}

export default RailEdge;
