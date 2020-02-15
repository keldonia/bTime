import { BinaryConversionUtil } from "../src/binaryTime/binaryConversionUtil";
import { ScheduleBinaryUtil } from "../src/binaryTime/scheduleBinaryUtil";
import { BinaryStringUtil } from "../src/binaryTime/binaryStringUtil";
import * as TestUtils from './utils/testUtils';


describe('binaryConversionUtil', () => {
  const binaryStringUtil: BinaryStringUtil = new BinaryStringUtil(5);
  const scheduleBinaryUtil: ScheduleBinaryUtil = new ScheduleBinaryUtil(binaryStringUtil);

  describe('getDatesFromFromStartDate', () => {
    const binaryConversionUtil: BinaryConversionUtil = new BinaryConversionUtil(binaryStringUtil, scheduleBinaryUtil);

    it('should properly create a weeks worth of Dates from a schedule, contained within a month', () => {
      const startDate: Date = new Date('2020-02-09T00:00:00Z');
      const dayOne: Date = new Date('2020-02-10T00:00:00Z');
      const dayTwo: Date = new Date('2020-02-11T00:00:00Z');
      const dayThree: Date = new Date('2020-02-12T00:00:00Z');
      const dayFour: Date = new Date('2020-02-13T00:00:00Z');
      const dayFive: Date = new Date('2020-02-14T00:00:00Z');
      const daySix: Date = new Date('2020-02-15T00:00:00Z');

      const expectedWeek: Date[] = [
        startDate,
        dayOne,
        dayTwo,
        dayThree,
        dayFour,
        dayFive,
        daySix
      ];
      const computedWeek: Date[] = binaryConversionUtil.getDatesFromFromStartDate(startDate);

      expect(computedWeek).toMatch(expectedWeek);
    });

    it('should properly create a weeks worth of Dates from a schedule, that crosses a month boundary', () => {

    });

    it('should properly create a weeks worth of Dates from a schedule, that crosses a year boundary', () => {

    });
  });
});