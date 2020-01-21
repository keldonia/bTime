import { BinaryStringUtil } from "./binaryStringUtil";
import { ScheduleBinaryUtil } from "./scheduleBinaryUtil";

export class BinaryTimeFactory {
    private timeInterval?: number;
    private binaryStringUtil?: BinaryStringUtil;
    private scheduleBinaryUtil?: ScheduleBinaryUtil;

    public constructor(timeInterval: number) {
        this.timeInterval = timeInterval;
        this.binaryStringUtil = new BinaryStringUtil(this.timeInterval);
        this.scheduleBinaryUtil = new ScheduleBinaryUtil(this.binaryStringUtil);
    }
}