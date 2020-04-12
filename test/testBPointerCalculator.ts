import * as TestUtils from './utils/testUtils';

import {hoursInDay } from '../src/@types';
import { BPointerCalculator } from '../src/binaryTime/bPointerCalculator';

describe('BPointerCalculator', () => {
  const bPointerCalculator: BPointerCalculator = new BPointerCalculator(5);

  describe('constructor', () => {
    it('should throw an error if an invalid time interval is supplied', () => {
      const timeInterval: number = 31;
      function test() {
        new BPointerCalculator(timeInterval);
      };

      expect(test).toThrow(`Invalid timeInterval entered for BPointerCalculator: ${timeInterval}`);
    });
  });

  describe("#findBPointerIncludingDay(), assumes 5 min interval", () => {
    const intervalsInDay: number = bPointerCalculator['intervalsInHour'] * hoursInDay;
    const tests = [
      { args: [0, 0, 0 ], expected: 0 * intervalsInDay },
      { args: [0, 4, 1 ], expected: 1 * intervalsInDay },
      { args: [0, 5, 1  ], expected: 1 + 1 * intervalsInDay },
      { args: [1, 0, 2 ], expected: 12 + 2 * intervalsInDay },
      { args: [1, 1, 3 ], expected: 12 + 3 * intervalsInDay },
      { args: [0, 47, 2 ], expected: 9 + 2 * intervalsInDay },
      { args: [0, 5, 6 ], expected: 1 + 6 * intervalsInDay },
      { args: [12, 0, 5 ], expected: 144 + 5 * intervalsInDay },
      { args: [13, 31, 4 ], expected: 162 + 4 * intervalsInDay },
      { args: [5, 25, 5 ], expected: 65 + 5 * intervalsInDay },
      { args: [8, 15, 3 ], expected: 99 + 3 * intervalsInDay },
      { args: [10, 42,  0 ], expected: 128 + 0 * intervalsInDay },
      { args: [20, 7, 4 ], expected: 241 + 4 * intervalsInDay },
      { args: [23, 59, 6 ], expected: 287 + 6 * intervalsInDay },
      { args: [24, 0, 0 ], expected: 288 },
      { args: [9, 0, 4 ], expected: 108 + 4 * intervalsInDay },
      { args: [12, 0, 2 ], expected: 144 + 2 * intervalsInDay }
    ];

    tests.forEach(test => {
      const hour: number = test.args[0];
      const minute: number = test.args[1];
      const day: number = test.args[2];
      const expected: number = test.expected;

      const testName: string = `should return ${expected} if hour is ${hour}, minute is ${minute}, and the day of the week is ${day}`;

      it(testName, () => {
        const testDate: Date = TestUtils.generateMockUTCDate(hour, minute, day) as Date;
        const bPointer: number = bPointerCalculator.findBPointerIncludingDay(testDate);

        expect(bPointer).toEqual(expected);
      });
    });
  });

  describe("#findBPointerModiferForDayOfWeek(), assumes 5 min interval", () => {
    const intervalsInDay: number = bPointerCalculator['intervalsInHour'] * hoursInDay;
    const tests = [
      { date: new Date('2020-02-09T00:00:00Z'), expected: 0 * intervalsInDay },
      { date: new Date('2020-02-10T00:00:00Z'), expected: 1 * intervalsInDay }, 
      { date: new Date('2020-02-11T00:00:00Z'), expected: 2 * intervalsInDay },
      { date: new Date('2020-02-12T00:00:00Z'), expected: 3 * intervalsInDay },
      { date: new Date('2020-02-13T00:00:00Z'), expected: 4 * intervalsInDay },
      { date: new Date('2020-02-14T00:00:00Z'), expected: 5 * intervalsInDay },
      { date: new Date('2020-02-15T00:00:00Z'), expected: 6 * intervalsInDay }
    ];

    tests.forEach(test => {
      const testName: string = `should return ${test.expected} when passed ${test.date}, which has is the ${test.date.getUTCDay()} of the week`;

      it(testName, () => {
        const calculatedDayOffset: number = bPointerCalculator.findBPointerModiferForDayOfWeek(test.date);

        expect(calculatedDayOffset).toEqual(test.expected);
      });
    });
  });

  describe("#findBPointer(), assumes 5 min interval", () => {
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

      const testName: string = `should return ${expected} if hour = ${hour} and minute = ${minute}`;

      it(testName, () => {
        const testDate: Date = TestUtils.generateMockUTCDate(hour, minute) as Date;
        const bPointer: number = bPointerCalculator.findBPointer(testDate);

        expect(bPointer).toEqual(expected);
      });
    });
  });
})