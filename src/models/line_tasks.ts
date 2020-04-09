import RailLine from "./rail_line";
import Platform from "./platform";
import RailEdge from "./rail_edge";
import RailNode from "./rail_node";
import modelListener from "./listener";

abstract class LineTask {
    public readonly parent: RailLine;
    public prev?: LineTask;
    public next?: LineTask;

    constructor(parent: RailLine, prev?: LineTask) {
        this.parent = parent;
        if (prev) {
            this.prev = prev;
            prev.next = this;
        } else {
            this.prev = this;
            this.next = this;
        }
        modelListener.lineTask.add(this);
    }

    public abstract getDept(): RailNode;
    public abstract getDest(): RailNode;

    /**
     * 指定された線路と隣接しているか判定します
     * @param edge 
     */
    protected abstract isNeighbor(edge: RailEdge): boolean;

    /**
     * 指定された線路を次の路線タスクとして設定します
     * @param edge 
     */
    extend(edge: RailEdge): LineTask {
        if (!this.isNeighbor(edge)) {
            console.warn(`try to extend to non-neighbored edge`);
            return this;
        }
        return new EdgeTask(this.parent, edge, this);
    }

    /**
     * 現在地点で路線を分断し、指定された往復路を路線タスクに挿入します
     * Before (a) ---------------> (b) -> (c)
     * After  (a) -> (X) -> (a) -> (b) -> (c)
     * * edge : (a) -> (X)
     * @param edge 
     */
    public abstract insertEdge(edge: RailEdge): void;
    public abstract insertPlatform(platform: Platform): void;
}

export class DeptTask extends LineTask {
    public readonly stay: Platform;

    constructor(parent: RailLine, stay: Platform, prev?: LineTask) {
        super(parent, prev);
        this.stay = stay;
    }

    public getDept() {
        return this.stay.on;
    }

    public getDest() {
        return this.stay.on;
    }

    protected isNeighbor(edge: RailEdge) {
        return this.stay.on == edge.from;
    }

    /**
     * 現在地点で路線を分断し、指定された往復路を路線タスクに挿入します
     * Before (a) = (a) -> (b)
     * After  (a) = (a) -> (X) -> (a) -> (a) -> (b)
     * * edge : (a) -> (X)
     * @param edge 
     */
    public insertEdge(edge: RailEdge) {
        if (!this.isNeighbor(edge)) {
            console.warn("try to insert non-neighbored edge");
            return;
        }

        const next = this.next;                // (a) -> (b)
        const outbound = this.extend(edge);    // (a) -> (X)
        const inbound = outbound.extend(edge); // (X) -> (a)
        const dept = new DeptTask(this.parent, this.stay, inbound); // (a) -> (a)
        dept.next = next;                   // (a) -> (b) -> (c)
        next.prev = dept;
    }

    public insertPlatform(platform: Platform) {
        console.warn("try to insert platform to DeptTask");
    }
}

class EdgeTask extends LineTask {
    public readonly edge: RailEdge;

    constructor(parent: RailLine, edge: RailEdge, prev: LineTask) {
        super(parent, prev);
        this.edge = edge;
    }

    public getDept() {
        return this.edge.from;
    }

    public getDest() {
        return this.edge.to;
    }

    protected isNeighbor(edge: RailEdge) {
        return this.edge.to == edge.from;
    }

    /**
     * 現在地点で路線を分断し、指定された往復路を路線タスクに挿入します
     * Before (a) ===============> (b) -> (c)
     * After  (a) => (X) -> (a) -> (b) -> (c)
     * * edge : (a) -> (X)
     * @param edge 
     */
    public insertEdge(edge: RailEdge) {
        if (!this.isNeighbor(edge)) {
            console.warn("try to insert non-neighbored edge");
            return;
        }

        const next = this.next;                // (b) -> (c)
        const outbound = this.extend(edge);    // (a) -> (X)
        const inbound = outbound.extend(edge); // (X) -> (a)
        inbound.next = next;                   // (a) -> (b) -> (c)
        next.prev = inbound;
    }

    /**
     * 新たに作成された駅を発車タスクとして挿入します
     * @param platform 
     */
    public insertPlatform(platform: Platform) {
        if (this.getDest() != platform.on) {
            console.warn("try to insert non-neighbored platform");
            return;
        }
        const next = this.next;
        const dept = new DeptTask(this.parent, platform, this);
        dept.next = next;
    }
}

export default LineTask;