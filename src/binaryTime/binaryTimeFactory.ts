import { BinaryStringUtil } from "./binaryStringUtils";

export class BinaryTimeFactory {
    private timeInterval?: number;
    private binaryStringUtil?: BinaryStringUtil;

    public constructor(timeInterval: number) {
        this.timeInterval = timeInterval;
        this.binaryStringUtil = new BinaryStringUtil(this.timeInterval);
    }
}