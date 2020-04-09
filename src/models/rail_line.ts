import LineTask, { DeptTask } from "./line_tasks";
import Platform from "./platform";
import RailEdge from "./rail_edge";
import RailNode from "./rail_node";
import modelListener from "./listener";

class RailLine {
    public top?: LineTask;

    constructor() {
        modelListener.railLine.add(this);
    }

    private filterDestIs(node: RailNode) {
        if (!this.top) {
            return [];
        }

        const result: LineTask[] = [];
        var current = this.top;
        do {
            if (current.getDest() == node) {
                result.push(current);
            }
            current = current.next;
        } while (current != this.top);
        return result;
    }

    /**
     * 路線設定を開始する。発車タスクを設定する
     * @param platform 
     */
    public start(platform: Platform) {
        if (this.top) {
            console.warn("try to start already constructed line");
            return;
        }
        this.top = new DeptTask(this, platform);
    }

    /**
     * 指定された線路を自路線に組み込みます
     * @param edge 
     */
    public insertEdge(edge: RailEdge) {
        if (!this.top) {
            console.warn("try to insert empty line");
            return;
        }
        this.filterDestIs(edge.from).forEach(lt => lt.insertEdge(edge));
    }

    /**
     * 指定された駅を自路線に組み込みます
     * @param platform 
     */
    public insertPlatform(platform: Platform) {
        if (!this.top) {
            console.warn("try to end empty line");
            return;
        }
        this.filterDestIs(platform.on).forEach(lt => lt.insertPlatform(platform));
    }
}

export default RailLine;