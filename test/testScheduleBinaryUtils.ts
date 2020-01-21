import * as TestUtils from './utils/testUtils';
import { ScheduleBinaryUtil } from './../src/binaryTime/scheduleBinaryUtil';
import { BinaryStringUtil } from '../src/binaryTime/binaryStringUtil';
import { MomentAppointment } from '../src/@types';

describe("Schedule Binary Utils", () => {
  const binaryStringUtil: BinaryStringUtil = new BinaryStringUtil(5);
  const scheduleBinaryUtil: ScheduleBinaryUtil = new ScheduleBinaryUtil(binaryStringUtil);

  describe("#mergeScheduleBStringWithTest()", () => {
    const tests = [
      { args: [ "000011110000", "000000000011" ], expected: "000011110011" },
      { args: [ "000000000000", "000000000011" ], expected: "000000000011" },
      { args: [ "000011110000", "000000000000" ], expected: "000011110000" },
      { args: [ "011000000000", "000000011000" ], expected: "011000011000" },
      { args: [ "100000000000", "000000011111" ], expected: "100000011111" },
      { args: [ "011110000000", "000011110000" ], expected: false },
      { args: [ "110000000000", "111100000000" ], expected: false },
      { args: [ "000000000111", "000000111110" ], expected: false }
    ];

    tests.forEach(test => {
      const appt1: string = test.args[0];
      const appt2: string = test.args[1];
      const expected: string | boolean = test.expected;
      const testName: string = "should expect binary appts of " +
        appt1 +
        " & " +
        appt2 +
        " to return " +
        expected;

      it(testName, () => {
        const mergedBStrings: string | false = scheduleBinaryUtil.mergeScheduleBStringWithTest(appt1, appt2);

        expect(mergedBStrings).toEqual(expected);
      });
    });
  });

  // Tests the loop over #mergeScheduleBStringsWithTest() works appropriately
  describe("#mergeScheduleBStringsWithTest()", () => {
    const tests = [
      { args: [1, 0, 1, 24, 0, 12, 0, 24], expected: "001110000000111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [1, 0, 1, 24, 4, 12, 5, 24], expected: "000000000000111110000000000000000000000000000000001111111111111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [0, 20, 0, 40, 0, 12, 0, 24], expected: false },
      { args: [12, 20, 13, 40, 13, 12, 15, 24], expected: false },
      { args: [13, 20, 12, 40, 13, 12, 15, 24], expected: false },
    ];

    tests.forEach(test => {
      const args: number[] = test.args;
      const appt1: MomentAppointment = TestUtils.generateMockAppointment(
        args[0], args[1], args[2], args[3]
      );
      const appt2: MomentAppointment = TestUtils.generateMockAppointment(
        args[4], args[5], args[6], args[7]
      );
      const appt2Str: string = binaryStringUtil.generateBinaryString(appt2) as string;
      const expected: string | boolean = test.expected;
      const testName: string = !!expected ?
        "should return schedule binary if appointments do not overlap" :
        "should return boolean false if appointments do overlap";

      it(testName, () => {
        const mergedBString: string | false = scheduleBinaryUtil.mergeScheduleBStringsWithTest(appt1, appt2Str);

        expect(mergedBString).toEqual(expected);
      });
    });
  });

  describe("#modifyScheduleAndBooking()", () => {
    // NB: We can test using these tests that only supply a single interval, as they will trigger the cases
    const tests = [
      { args: [ "000011110000", "000011111111", "000000000011" ], expected: "000011110011" },
      { args: [ "000000000000", "000000000000", "000000000011" ], expected: false },
      { args: [ "000011110000", "000011110000", "000000000000" ], expected: "000011110000" },
      { args: [ "011000000000", "000000000000", "000000011000" ], expected: false },
      { args: [ "100000000000", "111111111111", "000000011111" ], expected: "100000011111" },
      { args: [ "011110000000", "011110011111", "000000011111" ], expected: "011110011111" },
      { args: [ "011110000000", "000000000000", "000011110000" ], expected: false },
      { args: [ "110000000000", "000000000000", "111100000000" ], expected: false },
      { args: [ "000000000111", "000000000000", "000000111110" ], expected: false },
      { args: [ "000000000111", "111111111111", "000000111110" ], expected: false }
    ];

    tests.forEach(test => {
      const base: string = test.args[0];
      const testString: string = test.args[1];
      const appt: string = test.args[2];
      const expected: string | boolean = test.expected;
      const testName: string = "should expect binary base of " +
        base +
        " and test of " +
        testString +
        " with a change of " +
        appt +
        " to return " +
        expected;

      it(testName, () => {
        const modifiedSchedule: string | false = scheduleBinaryUtil.modifyScheduleAndBooking(base, testString, appt);

        expect(modifiedSchedule).toEqual(expected);
      });
    });

    it('should process multiple intervals', () => {
      const scheduleToModify: MomentAppointment = TestUtils.generateMockAppointment(
        12, 40, 17, 40
      );
      const baseAvailability: MomentAppointment = TestUtils.generateMockAppointment(
        12, 20, 19, 24
      );
      const appt: MomentAppointment = TestUtils.generateMockAppointment(
        12, 20, 12, 40
      );
      const expected: MomentAppointment = TestUtils.generateMockAppointment(
        12, 20, 17, 40
      );
      const scheduleToModifyStr: string = binaryStringUtil.generateBinaryString(scheduleToModify) as string;
      const baseAvailabilityStr: string = binaryStringUtil.generateBinaryString(baseAvailability) as string;
      const apptStr: string = binaryStringUtil.generateBinaryString(appt) as string;
      const expectedStr: string = binaryStringUtil.generateBinaryString(expected) as string;
      const computed: string = scheduleBinaryUtil.modifyScheduleAndBooking(scheduleToModifyStr, baseAvailabilityStr, apptStr) as string;

      expect(computed).toEqual(expectedStr);
    });
  });

  describe("#modifyScheduleAndBookingInterval()", () => {
    const tests = [
      { args: [ "000011110000", "000011111111", "000000000011" ], expected: "000011110011" },
      { args: [ "000000000000", "000000000000", "000000000011" ], expected: false },
      { args: [ "000011110000", "000011110000", "000000000000" ], expected: "000011110000" },
      { args: [ "011000000000", "000000000000", "000000011000" ], expected: false },
      { args: [ "100000000000", "111111111111", "000000011111" ], expected: "100000011111" },
      { args: [ "011110000000", "011110011111", "000000011111" ], expected: "011110011111" },
      { args: [ "011110000000", "000000000000", "000011110000" ], expected: false },
      { args: [ "110000000000", "000000000000", "111100000000" ], expected: false },
      { args: [ "000000000111", "000000000000", "000000111110" ], expected: false },
      { args: [ "000000000111", "111111111111", "000000111110" ], expected: false }
    ];

    tests.forEach(test => {
      const base: string = test.args[0];
      const testString: string = test.args[1];
      const appt: string = test.args[2];
      const expected: string | boolean = test.expected;
      const testName: string = "should expect binary base of " +
        base +
        " and test of " +
        testString +
        " with a change of " +
        appt +
        " to return " +
        expected;

      it(testName, () => {
        const modifiedSchedule: string | false = scheduleBinaryUtil.modifyScheduleAndBookingInterval(base, testString, appt);

        expect(modifiedSchedule).toEqual(expected);
      });
    });
  });

  describe("#deleteAppointment()", () => {
    const tests = [
      { args: [1, 0, 1, 24, 0, 12, 0, 24], expected: "001110000000111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [1, 0, 1, 24, 4, 12, 5, 24], expected: "000000000000111110000000000000000000000000000000001111111111111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [0, 20, 0, 40, 0, 12, 0, 24], expected: "001101110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [12, 20, 13, 40, 13, 12, 15, 24], expected: "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011111111110000001111111111111111111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },

    ];

    tests.forEach(test => {
      const args: number[] = test.args;
      const appt1: MomentAppointment = TestUtils.generateMockAppointment(
        args[0], args[1], args[2], args[3]
      );
      const appt2: MomentAppointment = TestUtils.generateMockAppointment(
        args[4], args[5], args[6], args[7]
      );
      const appt2Str: string = binaryStringUtil.generateBinaryString(appt2) as string;
      const expected: string | boolean = test.expected;
      const testName: string = !!expected ?
        "should return schedule binary if appointments do not overlap" :
        "should return boolean false if appointments do overlap";


      it(testName, () => {
        const mergedBString: string | false = scheduleBinaryUtil.deleteAppointment(appt1, appt2Str);
        expect(mergedBString).toEqual(expected);
      });
    });

    it('should through an error when passed an invalid appointment to delete', () => {
      const invalidAppt: MomentAppointment = TestUtils.generateMockAppointment(
        12, 20, 11, 40
      );
      const appt2: MomentAppointment = TestUtils.generateMockAppointment(
        13, 12, 15, 24
      );
      const appt2Str: string = binaryStringUtil.generateBinaryString(appt2) as string;
      function test() {
        scheduleBinaryUtil.deleteAppointment(invalidAppt, appt2Str);
      }
      
      expect(test).toThrow('Invalid appt passed to delete appointment: start: 12:20 on 1 :: end: 11:40 on 1');
    });
  });

  describe("#deleteAppointmentInterval()", () => {
    const tests = [
      { args: [ "000011110011", "000000000011" ], expected: "000011110000" },
      { args: [ "000000000000", "000000000011" ], expected: "000000000011" },
      { args: [ "000011110000", "000000000000" ], expected: "000011110000" },
      { args: [ "011000011000", "000000011000" ], expected: "011000000000" },
      { args: [ "100000011111", "000000011111" ], expected: "100000000000" },
      { args: [ "011110000000", "000110000000" ], expected: "011000000000" },
      { args: [ "111100000000", "110000000000" ], expected: "001100000000" },
      { args: [ "000000111110", "000000000110" ], expected: "000000111000" }
    ];

    tests.forEach(test => {
      const base: string = test.args[0];
      const appt: string = test.args[1];
      const expected: string = test.expected;
      const testName: string = "should expect binary base of " +
        base +
        " and deleted appt of " +
        appt +
        " to return " +
        expected;

      it(testName, () => {
        const deleteAppointmentSchedule: string | false = scheduleBinaryUtil.deleteAppointmentInterval(base, appt);

        expect(deleteAppointmentSchedule).toEqual(expected);
      });
    });
  });
});