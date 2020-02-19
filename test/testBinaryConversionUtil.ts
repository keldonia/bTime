import { BinaryConversionUtil } from "../src/binaryTime/binaryConversionUtil";
import { ScheduleBinaryUtil } from "../src/binaryTime/scheduleBinaryUtil";
import { BinaryStringUtil } from "../src/binaryTime/binaryStringUtil";
import * as TestUtils from './utils/testUtils';
import { Appointment } from "../src/@types";


describe('binaryConversionUtil', () => {
  const binaryStringUtil: BinaryStringUtil = new BinaryStringUtil(5);
  const scheduleBinaryUtil: ScheduleBinaryUtil = new ScheduleBinaryUtil(binaryStringUtil);

  describe('getDatesFromFromStartDate', () => {
    const binaryConversionUtil: BinaryConversionUtil = new BinaryConversionUtil(binaryStringUtil, scheduleBinaryUtil, 5);

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

      expect(computedWeek).toEqual(expect.arrayContaining(expectedWeek));
      expect(computedWeek).toStrictEqual(expectedWeek);
    });

    it('should properly create a weeks worth of Dates from a schedule, that crosses a month boundary', () => {
      const startDate: Date = new Date('2020-03-29T00:00:00Z');
      const dayOne: Date = new Date('2020-03-30T00:00:00Z');
      const dayTwo: Date = new Date('2020-03-31T00:00:00Z');
      const dayThree: Date = new Date('2020-04-01T00:00:00Z');
      const dayFour: Date = new Date('2020-04-02T00:00:00Z');
      const dayFive: Date = new Date('2020-04-03T00:00:00Z');
      const daySix: Date = new Date('2020-04-04T00:00:00Z');

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

      expect(computedWeek).toEqual(expect.arrayContaining(expectedWeek));
      expect(computedWeek).toStrictEqual(expectedWeek);
    });

    it('should properly create a weeks worth of Dates from a schedule, that crosses a year boundary', () => {
      const startDate: Date = new Date('2019-12-29T00:00:00Z');
      const dayOne: Date = new Date('2019-12-30T00:00:00Z');
      const dayTwo: Date = new Date('2019-12-31T00:00:00Z');
      const dayThree: Date = new Date('2020-01-01T00:00:00Z');
      const dayFour: Date = new Date('2020-01-02T00:00:00Z');
      const dayFive: Date = new Date('2020-01-03T00:00:00Z');
      const daySix: Date = new Date('2020-01-04T00:00:00Z');

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

      expect(computedWeek).toEqual(expect.arrayContaining(expectedWeek));
      expect(computedWeek).toStrictEqual(expectedWeek);
    });
  });

  describe('calculateDate', () => {
    const timeInterval: number = 5;
    const binaryConversionUtil: BinaryConversionUtil = new BinaryConversionUtil(binaryStringUtil, scheduleBinaryUtil, timeInterval);
    const baseDate: Date = new Date('2019-12-29T00:00:00Z');

    it('should properly calculate a datetime that is at the beginning of the day, and is the beginning of an appointment', () => {
      const baseDate: Date = new Date('2019-12-29T00:00:00Z');
      const timePointer: number = 0;
      const beginning: boolean = true;
      const expectedDate: Date = new Date('2019-12-29T00:00:00Z');
      const computedDate: Date = binaryConversionUtil.calculateDate(timePointer, baseDate, beginning);
      
      expect(computedDate).toEqual(expectedDate);
    });

    it('should properly calculate a datetime that is at the beginning of the day, and is the end of an appointment', () => {
      const baseDate: Date = new Date('2019-12-29T00:00:00Z');
      const timePointer: number = 0;
      const beginning: boolean = false;
      const expectedDate: Date = new Date('2019-12-29T00:00:00Z');
      const computedDate: Date = binaryConversionUtil.calculateDate(timePointer, baseDate, beginning);
      
      expect(computedDate).toEqual(expectedDate);
    });

    it('should properly calculate a datetime that is at the end of the day, and is the beginning of an appointment', () => {
      const timePointer: number = 287;
      const beginning: boolean = true;
      const expectedDate: Date = new Date('2019-12-29T23:55:00Z');
      const computedDate: Date = binaryConversionUtil.calculateDate(timePointer, baseDate, beginning);
      
      expect(computedDate).toEqual(expectedDate);
    });

    it('should properly calculate a datetime that is at the end of the day, and is the end of an appointment', () => {
      const timePointer: number = 287;
      const beginning: boolean = false;
      const expectedDate: Date = new Date('2019-12-29T23:55:00Z');
      const computedDate: Date = binaryConversionUtil.calculateDate(timePointer, baseDate, beginning);
      
      expect(computedDate).toEqual(expectedDate);
    });

    it('should properly calculate a datetime that is at the middle of the day, and is the beginning of an appointment', () => {
      const timePointer: number = 144;
      const beginning: boolean = true;
      const expectedDate: Date = new Date('2019-12-29T12:00:00Z');
      const computedDate: Date = binaryConversionUtil.calculateDate(timePointer, baseDate, beginning);
      
      expect(computedDate).toEqual(expectedDate);
    });

    it('should properly calculate a datetime that is at the middle of the day, and is the end of an appointment', () => {
      const timePointer: number = 144;
      const beginning: boolean = false;
      const expectedDate: Date = new Date('2019-12-29T12:00:00Z');
      const computedDate: Date = binaryConversionUtil.calculateDate(timePointer, baseDate, beginning);
      
      expect(computedDate).toEqual(expectedDate);
    });
  });

  describe('convertTimeSlotsStringToAppointments', () => {
    const timeInterval: number = 5;
    const binaryConversionUtil: BinaryConversionUtil = new BinaryConversionUtil(binaryStringUtil, scheduleBinaryUtil, timeInterval);
    const baseDate: Date = new Date('2019-12-29T00:00:00Z');

    it('should return an empty appointment array, if there were no time slots', () => {
      const emptyDay: string = TestUtils.emptyDay();
      const expectedAppointments: Appointment[] = [];
      const computedAppointments: Appointment[] = binaryConversionUtil.convertTimeSlotsStringToAppointments(emptyDay, baseDate);

      expect(computedAppointments).toEqual(expectedAppointments);
    });

    it('should return an appointment array with one appointment, if there was one contigous segment that spans across the whole day', () => {
      const simpleAppointment: Appointment = {
        startTime: new Date('2019-12-29T00:00:00Z'),
        endTime: new Date('2019-12-29T23:59:59Z')
      }
      const timeSlots: string = binaryStringUtil.generateBinaryString(simpleAppointment) as string;
      const expectedAppointments: Appointment[] = [simpleAppointment];
      const computedAppointments: Appointment[] = binaryConversionUtil.convertTimeSlotsStringToAppointments(timeSlots, baseDate);

      expect(computedAppointments).toEqual(expectedAppointments);
    });

    it('should return an appointment array with one appointment, if there was one contigous segment in the middle of the day', () => {
      const simpleAppointment: Appointment = {
        startTime: new Date('2019-12-29T13:00:00Z'),
        endTime: new Date('2019-12-29T14:45:00Z')
      }
      const timeSlots: string = binaryStringUtil.generateBinaryString(simpleAppointment) as string;
      const expectedAppointments: Appointment[] = [simpleAppointment];
      const computedAppointments: Appointment[] = binaryConversionUtil.convertTimeSlotsStringToAppointments(timeSlots, baseDate);

      expect(computedAppointments).toEqual(expectedAppointments);
    });

    it('should return an appointment array with one appointment, if there was one contigous segment at the start of the day', () => {
      const simpleAppointment: Appointment = {
        startTime: new Date('2019-12-29T00:00:00Z'),
        endTime: new Date('2019-12-29T14:45:00Z')
      }
      const timeSlots: string = binaryStringUtil.generateBinaryString(simpleAppointment) as string;
      const expectedAppointments: Appointment[] = [simpleAppointment];
      const computedAppointments: Appointment[] = binaryConversionUtil.convertTimeSlotsStringToAppointments(timeSlots, baseDate);

      expect(computedAppointments).toEqual(expectedAppointments);
    });

    it('should return an appointment array with one appointment, if there was one contigous segment close to the start of the day', () => {
      const simpleAppointment: Appointment = {
        startTime: new Date('2019-12-29T00:05:00Z'),
        endTime: new Date('2019-12-29T14:45:00Z')
      }
      const timeSlots: string = binaryStringUtil.generateBinaryString(simpleAppointment) as string;
      const expectedAppointments: Appointment[] = [simpleAppointment];
      const computedAppointments: Appointment[] = binaryConversionUtil.convertTimeSlotsStringToAppointments(timeSlots, baseDate);

      expect(computedAppointments).toEqual(expectedAppointments);
    });

    it('should return an appointment array with one appointment, if there was one contigous segment at the end of the day', () => {
      const simpleAppointment: Appointment = {
        startTime: new Date('2019-12-29T13:00:00Z'),
        endTime: new Date('2019-12-29T23:59:59Z')
      }
      const timeSlots: string = binaryStringUtil.generateBinaryString(simpleAppointment) as string;
      const expectedAppointments: Appointment[] = [simpleAppointment];
      const computedAppointments: Appointment[] = binaryConversionUtil.convertTimeSlotsStringToAppointments(timeSlots, baseDate);

      expect(computedAppointments).toEqual(expectedAppointments);
    });

    it('should return an appointment array with one appointment, if there was one contigous segment close to the end of the day', () => {
      const simpleAppointment: Appointment = {
        startTime: new Date('2019-12-29T13:00:00Z'),
        endTime: new Date('2019-12-29T23:55:00Z')
      }
      const timeSlots: string = binaryStringUtil.generateBinaryString(simpleAppointment) as string;
      const expectedAppointments: Appointment[] = [simpleAppointment];
      const computedAppointments: Appointment[] = binaryConversionUtil.convertTimeSlotsStringToAppointments(timeSlots, baseDate);

      expect(computedAppointments).toEqual(expectedAppointments);
    });

    it('should return an appointment array with one appointment, if there was one contigous segment close to the end of the day', () => {
      const simpleAppointment: Appointment = {
        startTime: new Date('2019-12-29T13:00:00Z'),
        endTime: new Date('2019-12-29T23:59:59Z')
      }
      const timeSlots: string = binaryStringUtil.generateBinaryString(simpleAppointment) as string;
      const expectedAppointments: Appointment[] = [simpleAppointment];
      const computedAppointments: Appointment[] = binaryConversionUtil.convertTimeSlotsStringToAppointments(timeSlots, baseDate);

      expect(computedAppointments).toEqual(expectedAppointments);
    });

    it('should return an appointment array with two appointment, if there were two segments', () => {
      const appointmentOne: Appointment = {
        startTime: new Date('2019-12-29T10:00:00Z'),
        endTime: new Date('2019-12-29T12:00:00Z')
      }
      const appointmentTwo: Appointment = {
        startTime: new Date('2019-12-29T13:00:00Z'),
        endTime: new Date('2019-12-29T15:00:00Z')
      }
      const timeSlots: string = "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000111111111111111111111111000000000000111111111111111111111111000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";
      const expectedAppointments: Appointment[] = [appointmentOne, appointmentTwo];
      const computedAppointments: Appointment[] = binaryConversionUtil.convertTimeSlotsStringToAppointments(timeSlots, baseDate);

      expect(computedAppointments).toEqual(expectedAppointments);
    });

    it('should return an appointment array with three appointment, if there were three segments', () => {
      const appointmentOne: Appointment = {
        startTime: new Date('2019-12-29T10:00:00Z'),
        endTime: new Date('2019-12-29T12:00:00Z')
      }
      const appointmentTwo: Appointment = {
        startTime: new Date('2019-12-29T13:00:00Z'),
        endTime: new Date('2019-12-29T15:00:00Z')
      }
      const appointmentThree: Appointment = {
        startTime: new Date('2019-12-29T16:00:00Z'),
        endTime: new Date('2019-12-29T17:00:00Z')
      }
      const timeSlots: string = "000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000111111111111111111111111000000000000111111111111111111111111000000000000111111111111000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

      const expectedAppointments: Appointment[] = [appointmentOne, appointmentTwo, appointmentThree];
      const computedAppointments: Appointment[] = binaryConversionUtil.convertTimeSlotsStringToAppointments(timeSlots, baseDate);

      expect(computedAppointments).toEqual(expectedAppointments);
    });
  });
});