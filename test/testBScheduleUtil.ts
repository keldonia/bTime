import * as TestUtils from './utils/testUtils';
import { BScheduleUtil } from '../src/bTime/bScheduleUtil';
import { BStringUtil } from '../src/bTime/bStringUtil';
import { Appointment } from '../src/@types';

describe("bScheduleUtil", () => {
  const bStringUtil: BStringUtil = new BStringUtil(5);
  const bScheduleUtil: BScheduleUtil = new BScheduleUtil(bStringUtil);

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
        const mergedBStrings: string | false = bScheduleUtil.mergeScheduleBStringWithTest(appt1, appt2);

        expect(mergedBStrings).toEqual(expected);
      });
    });
  });

  // Tests the loop over #mergeScheduleBStringsWithTest() works appropriately
  describe("loop #mergeScheduleBStringsWithTest()", () => {
    const tests = [
      { args: [1, 0, 1, 24, 0, 12, 0, 24], expected: "001110000000111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [1, 0, 1, 24, 4, 12, 5, 24], expected: "000000000000111110000000000000000000000000000000001111111111111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [0, 20, 0, 40, 0, 12, 0, 24], expected: false },
      { args: [12, 20, 13, 40, 13, 12, 15, 24], expected: false },
      { args: [13, 20, 12, 40, 13, 12, 15, 24], expected: `BSchedule Error: Invalid timeslot passed to merge schedule BString: start: 13:20 on 0 :: end: 12:40 on 0` },
      { args: [0, 20, 0, 20, 0, 20, 0, 24], expected: false },
    ];

    tests.forEach(test => {
      const args: number[] = test.args;
      const appt1: Appointment = TestUtils.generateMockDateAppointment(
        args[0], args[1], args[2], args[3]
      );
      const appt2: Appointment = TestUtils.generateMockDateAppointment(
        args[4], args[5], args[6], args[7]
      );
      const appt2Str: string = bStringUtil.generateBString(appt2) as string;
      const expected: string | boolean = test.expected;
      const testName: string = !!expected ?
        "should return schedule binary if appointments do not overlap" :
        "should return boolean false if appointments do overlap";

      it(testName, () => {
        if (typeof expected === 'string' && expected.startsWith('B')) {
          expect(() => bScheduleUtil.mergeScheduleBStringsWithTest(appt1, appt2Str)).toThrow(expected);
        } else {
          const mergedBString: string | false = bScheduleUtil.mergeScheduleBStringsWithTest(appt1, appt2Str);

          expect(mergedBString).toEqual(expected);
        }
      });
    });
  });

  describe("#modifyScheduleAndBooking()", () => {
    // NB: We can test using these tests that only supply a single interval, as they will trigger the cases
    const tests = [
      { args: [ "000011110000", "000011111111", "000000000011" ], expected: "000011110011" },
      { args: [ "000000000000", "000000000000", "000000000011" ], expected: 'BScheduleUtil Error: Time intervals overlap.' },
      { args: [ "000011110000", "000011110000", "000000000000" ], expected: "000011110000" },
      { args: [ "011000000000", "000000000000", "000000011000" ], expected: 'BScheduleUtil Error: Time intervals overlap.' },
      { args: [ "100000000000", "111111111111", "000000011111" ], expected: "100000011111" },
      { args: [ "011110000000", "011110011111", "000000011111" ], expected: "011110011111" },
      { args: [ "011110000000", "000000000000", "000011110000" ], expected: 'BScheduleUtil Error: Time intervals overlap.' },
      { args: [ "110000000000", "000000000000", "111100000000" ], expected: 'BScheduleUtil Error: Time intervals overlap.' },
      { args: [ "000000000111", "000000000000", "000000111110" ], expected: 'BScheduleUtil Error: Time intervals overlap.' },
      { args: [ "000000000111", "111111111111", "000000111110" ], expected: 'BScheduleUtil Error: Time intervals overlap.' }
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
        if (typeof expected === 'string' && expected.startsWith('B')) {
          expect(() => bScheduleUtil.modifyScheduleAndBooking(base, testString, appt)).toThrow(expected);
        } else {
          const modifiedSchedule: string | false = bScheduleUtil.modifyScheduleAndBooking(base, testString, appt);

          expect(modifiedSchedule).toEqual(expected);
        }
      });
    });

    it('should process multiple intervals', () => {
      const scheduleToModify: Appointment = TestUtils.generateMockDateAppointment(
        12, 40, 17, 40
      );
      const baseAvailability: Appointment = TestUtils.generateMockDateAppointment(
        12, 20, 19, 24
      );
      const appt: Appointment = TestUtils.generateMockDateAppointment(
        12, 20, 12, 39
      );
      const expected: Appointment = TestUtils.generateMockDateAppointment(
        12, 20, 17, 40
      );
      const scheduleToModifyStr: string = bStringUtil.generateBString(scheduleToModify) as string;
      const baseAvailabilityStr: string = bStringUtil.generateBString(baseAvailability) as string;
      const apptStr: string = bStringUtil.generateBString(appt) as string;
      const expectedStr: string = bStringUtil.generateBString(expected) as string;
      const computed: string = bScheduleUtil.modifyScheduleAndBooking(scheduleToModifyStr, baseAvailabilityStr, apptStr) as string;

      expect(computed).toEqual(expectedStr);
    });
  });

  describe("#modifyScheduleAndBookingInterval()", () => {
    const tests = [
      { args: [ "000011110000", "000011111111", "000000000011" ], expected: "000011110011" },
      { args: [ "000000000000", "000000000000", "000000000011" ], expected: 'BScheduleUtil Error: Time intervals overlap.' },
      { args: [ "000011110000", "000011110000", "000000000000" ], expected: "000011110000" },
      { args: [ "011000000000", "000000000000", "000000011000" ], expected: 'BScheduleUtil Error: Time intervals overlap.' },
      { args: [ "100000000000", "111111111111", "000000011111" ], expected: "100000011111" },
      { args: [ "011110000000", "011110011111", "000000011111" ], expected: "011110011111" },
      { args: [ "011110000000", "000000000000", "000011110000" ], expected: 'BScheduleUtil Error: Time intervals overlap.' },
      { args: [ "110000000000", "000000000000", "111100000000" ], expected: 'BScheduleUtil Error: Time intervals overlap.' },
      { args: [ "000000000111", "000000000000", "000000111110" ], expected: 'BScheduleUtil Error: Time intervals overlap.' },
      { args: [ "000000000111", "111111111111", "000000111110" ], expected: 'BScheduleUtil Error: Time intervals overlap.' }
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
        if (typeof expected === 'string' && expected.startsWith('B')) {
          expect(() => bScheduleUtil.modifyScheduleAndBookingInterval(base, testString, appt)).toThrow(expected);
        } else {
          const modifiedSchedule: string | false = bScheduleUtil.modifyScheduleAndBookingInterval(base, testString, appt);

          expect(modifiedSchedule).toEqual(expected);
        }
      });
    });
  });

  describe("#deleteAppointment()", () => {
    const tests = [
      { args: [1, 0, 1, 24, 0, 12, 1, 24], expected: "001111111111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [1, 0, 1, 24, 4, 12, 5, 24], expected: 'BScheduleUtil Error: invalid deletion, interval to delete occurs outside of schedule interval. To be deleted: 111110000000 Schedule: 000000000000' },
      { args: [0, 20, 0, 40, 0, 12, 0, 40], expected: "001100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [12, 20, 13, 40, 13, 12, 15, 24], expected: 'BScheduleUtil Error: invalid deletion, interval to delete occurs outside of schedule interval. To be deleted: 000011111111 Schedule: 000000000000' },
      { args: [0, 20, 0, 40, 0, 12, 12, 40], expected: "001100000111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [0, 20, 0, 40, 0, 12, 0, 24], expected: 'BScheduleUtil Error: invalid deletion, interval to delete occurs outside of schedule interval. To be deleted: 000011111000 Schedule: 001110000000' },
      { args: [0, 20, 0, 20, 0, 20, 0, 24], expected: "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
    ];

    tests.forEach(test => {
      const args: number[] = test.args;
      const appt1: Appointment = TestUtils.generateMockDateAppointment(
        args[0], args[1], args[2], args[3]
      );
      const appt2: Appointment = TestUtils.generateMockDateAppointment(
        args[4], args[5], args[6], args[7]
      );
      const appt2Str: string = bStringUtil.generateBString(appt2) as string;
      const expected: string | boolean = test.expected;
      const testName: string = `should${expected.toString().startsWith('B') ? 'n\'t' : ''} delete an appointment of ${args[0]}:${args[1]} to ${args[2]}:${args[3]} from a base of ${args[4]}:${args[5]} to ${args[6]}:${args[7]}`;


      it(testName, () => {
        if (typeof expected === 'string' && expected.startsWith('B')) {
          expect(() => bScheduleUtil.deleteAppointment(appt1, appt2Str))
            .toThrow(expected)
        } else {
          const mergedBString: string | false = bScheduleUtil.deleteAppointment(appt1, appt2Str);
          expect(mergedBString).toEqual(expected);
        }
      });
    });

    it('should through an error when passed an invalid appointment to delete', () => {
      const invalidAppt: Appointment = TestUtils.generateMockDateAppointment(
        12, 20, 11, 40
      );
      const appt2: Appointment = TestUtils.generateMockDateAppointment(
        13, 12, 15, 24
      );
      const appt2Str: string = bStringUtil.generateBString(appt2) as string;
      function test() {
        bScheduleUtil.deleteAppointment(invalidAppt, appt2Str);
      }
      
      expect(test).toThrow('BSchedule Error: Invalid appointment passed to delete appointment: start: 12:20 on 0 :: end: 11:40 on 0');
    });
  });

  describe("#deleteAppointmentInterval()", () => {
    const tests = [
      { args: [ "000011110011", "000000000011" ], expected: "000011110000" },
      { args: [ "000000000000", "000000000011" ], expected: `BScheduleUtil Error: invalid deletion, interval to delete occurs outside of schedule interval. To be deleted: 000000000011 Schedule: 000000000000` },
      { args: [ "000011110000", "000000000000" ], expected: "000011110000" },
      { args: [ "011000011000", "000000011000" ], expected: "011000000000" },
      { args: [ "100000011111", "000000011111" ], expected: "100000000000" },
      { args: [ "011110000000", "000110000000" ], expected: "011000000000" },
      { args: [ "111100000000", "110000000000" ], expected: "001100000000" },
      { args: [ "000000111110", "000000000110" ], expected: "000000111000" },
    ];

    tests.forEach(test => {
      const base: string = test.args[0];
      const appt: string = test.args[1];
      const expected: string | boolean = test.expected;
      const testName: string = "should expect binary base of " +
        base +
        " and deleted appt of " +
        appt +
        " to return " +
        expected;

      it(testName, () => {
        if (typeof expected === 'string' && expected.startsWith('B')) {
          expect(() => bScheduleUtil.deleteAppointmentInterval(appt, base))
            .toThrow(expected)
        } else {
          const deleteAppointmentSchedule: string = bScheduleUtil.deleteAppointmentInterval(appt, base);

          expect(deleteAppointmentSchedule).toEqual(expected);
        }
      });
    });
  });

  describe("#validDeletion()", () => {
    const tests = [
      { args: [ "000011110011", "000000000011" ], expected: true },
      { args: [ "000000000000", "000000000011" ], expected: false },
      { args: [ "000011110000", "000000000000" ], expected: true },
      { args: [ "011000011000", "000000011000" ], expected: true },
      { args: [ "100000011111", "000000011111" ], expected: true },
      { args: [ "011110000000", "000110000000" ], expected: true },
      { args: [ "111100000000", "110000000000" ], expected: true },
      { args: [ "000000111110", "000000000110" ], expected: true },
    ];

    tests.forEach(test => {
      const base: number = bStringUtil.parseBString(test.args[0]);
      const appt: number = bStringUtil.parseBString(test.args[1]);
      const expected: string | boolean = test.expected;
      const testName: string = "should expect binary base of " +
        base +
        " and deleted appt of " +
        appt +
        " to return " +
        expected;

      it(testName, () => {
        const deleteAppointmentSchedule: boolean = bScheduleUtil.validDeletion(base, appt);

        expect(deleteAppointmentSchedule).toEqual(expected);
      });
    });
  });
});