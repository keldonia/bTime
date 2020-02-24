import * as TestUtils from './utils/testUtils';
import { BinaryStringUtil } from './../src/binaryTime/binaryStringUtil';
import { Appointment } from '../src/@types';

describe("Binary Utils", () => {
  const binaryStringUtil: BinaryStringUtil = new BinaryStringUtil(5);

  describe('constructor', () => {
    it('should throw an error if an invalid time interval is supplied', () => {
      const timeInterval: number = 31;
      function test() {
        new BinaryStringUtil(timeInterval);
      };

      expect(test).toThrow(`Invalid timeInterval entered for BinaryStringUtil: ${timeInterval}`);
    });
  });

  describe("#findBinaryPointer(), assumes 5 min interval", () => {
    const tests = [
      { args: [0, 0], expected: 0 },
      { args: [0, 4], expected: 0 },
      { args: [0, 5], expected: 1 },
      { args: [1, 0], expected: 12 },
      { args: [1, 1], expected: 12 },
      { args: [0, 47], expected: 9 },
      { args: [0, 5], expected: 1 },
      { args: [12, 0], expected: 144 },
      { args: [13, 31], expected: 162 },
      { args: [5, 25], expected: 65 },
      { args: [8, 15], expected: 99 },
      { args: [10, 42], expected: 128 },
      { args: [20, 7], expected: 241 },
      { args: [23, 59], expected: 287 },
      { args: [24, 0], expected: 288 },
      { args: [9, 0], expected: 108 },
      { args: [12, 0], expected: 144 }
    ];

    tests.forEach(test => {
      const hour: number = test.args[0];
      const minute: number = test.args[1];
      const expected: number = test.expected;

      const testName: string = "should return " +
        expected +
        " if hour = " +
        hour +
        " and minute = " +
        minute;

      it(testName, () => {
        const testDate: Date = TestUtils.generateMockUTCDate(hour, minute) as Date;
        const binaryPointer: number = binaryStringUtil.findBinaryPointer(testDate);

        expect(binaryPointer).toEqual(expected);
      });
    });
  });

  describe("#generateBinaryString(), assumes 5 min interval", () => {
    const tests = [
      { args: [4, 12, 5, 5], expected: "000000000000000000000000000000000000000000000000001111111111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [0, 12, 0, 24], expected: "001110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [1, 0, 1, 24], expected: "000000000000111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [0, 20, 0, 40], expected: "000011111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [0, 20, 0, 39], expected: "000011110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [0, 0, 0, 19], expected: "111100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [4, 20, 1, 40], expected: false },
      { args: [0, 20, 0, 24], expected: "000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [0, 20, 0, 21], expected: "000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" }
    ];

    tests.forEach(test => {
      const args = test.args;
      const testAppt: Appointment = TestUtils.generateMockDateAppointment(
        args[0], args[1], args[2], args[3]
      );
      const expected = test.expected;
      const testName = `should properly construct binary representation of appointment start: ${args[0]}:${args[1]} 
       and end: ${args[2]}:${args[3]}`;

      it(testName, () => {
        const bString: string | false = binaryStringUtil.generateBinaryString(testAppt);
        
        expect(bString).toEqual(expected);
      });
    });
  });

  describe("#timeStringSplit", () => {
    const emptyHour: string = "000000000000";

    it('should return an array of empty hours if passed an empty string', () => {
      const expectedHours: string[] = new Array(24).fill(emptyHour);
      const computedHours: string[] = binaryStringUtil.timeStringSplit(TestUtils.emptyDay());

      expect(computedHours).toEqual(expectedHours);
    });
  });

  describe("#parseBString", () => {
    it('should return 0 when passed a binary string equal to 0', () => {
      const zero: string = "000000000000";
      const computed: number = binaryStringUtil.parseBString(zero);

      expect(computed).toEqual(0);
    });

    it('should return 2 when passed a binary string equal to 2', () => {
      const two: string = "000000000010";
      const computed: number = binaryStringUtil.parseBString(two);

      expect(computed).toEqual(2);
    });

    it('should return 256 when passed a binary string equal to 256', () => {
      const two: string = "000100000000";
      const computed: number = binaryStringUtil.parseBString(two);

      expect(computed).toEqual(256);
    });
  });

  describe("#decimalToBinaryString", () => {
    it('should return a binary string equal to 0 when passed 0', () => {
      const zero: string = "000000000000";
      const computed: string = binaryStringUtil.decimalToBinaryString(0);

      expect(computed).toEqual(zero);
    });

    it('should return a binary string equal to 2 when passed 2', () => {
      const two: string = "000000000010";
      const computed: string = binaryStringUtil.decimalToBinaryString(2);

      expect(computed).toEqual(two);
    });

    it('should return a binary string equal to 256 when passed 256', () => {
      const number: string = "000100000000";
      const computed: string = binaryStringUtil.decimalToBinaryString(256);

      expect(computed).toEqual(number);
    });
  });
});