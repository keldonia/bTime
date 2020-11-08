import * as TestUtils from './utils/testUtils';
import { BTimeFactory } from '../src/bTime/index';
import { BScheduleUtil } from '../src/bTime/bScheduleUtil';
import { BStringUtil } from '../src/bTime/bStringUtil';
import { Appointment, Schedule } from '../src/@types';
import { BConversionUtil } from '../src/bTime/bConversionUtil';

describe('bTime Factory', () => {
  describe('constructor', () => {
    it('should not throw an error if an valid time interval is supplied: 3', () => {
      const timeInterval: number = 3;
      function test() {
        new BTimeFactory(timeInterval);
      };

      expect(test).not.toThrow();
    });

    it('should not throw an error if an valid time interval is supplied: 5', () => {
      const timeInterval: number = 5;
      function test() {
        new BTimeFactory(timeInterval);
      };

      expect(test).not.toThrow();
    });

    it('should throw an error if an invalid time interval is supplied: 7', () => {
      const timeInterval: number = 7;
      function test() {
        new BTimeFactory(timeInterval);
      };

      expect(test).toThrow(`Invalid timeInterval entered for BTimeFactory: ${timeInterval}`);
    });
  });

  describe('test pass-through methods', () => {
    const bTimeFactory: BTimeFactory = new BTimeFactory(5);
    const bScheduleUtil: BScheduleUtil = bTimeFactory['bScheduleUtil'];
    const bStringUtil: BStringUtil = bTimeFactory['bStringUtil'];
    const bConversionUtil: BConversionUtil = bTimeFactory['bConversionUtil'];
    
    const mockParseBString: jest.Mock = jest.fn();
    const mockGenerateBString: jest.Mock = jest.fn();
    const mockGenerateBStringFromAppointments: jest.Mock = jest.fn();
    const mockTimeStringSplit: jest.Mock = jest.fn();
    const mockDecimalToBString: jest.Mock = jest.fn();
    const mockTestViabilityAndCompute: jest.Mock = jest.fn();
    const mockDeleteAppointment: jest.Mock = jest.fn();
    const mockDeleteAppointmentBString: jest.Mock = jest.fn();
    const mockModifyScheduleAndBooking: jest.Mock = jest.fn();
    const mockConvertScheduleToAppointmentSchedule: jest.Mock = jest.fn();

    bStringUtil.parseBString = mockParseBString;
    bStringUtil.generateBString = mockGenerateBString;
    bStringUtil.generateBStringFromAppointments = mockGenerateBStringFromAppointments;
    bStringUtil.timeStringSplit = mockTimeStringSplit;
    bStringUtil.decimalToBString = mockDecimalToBString;
    bScheduleUtil.testViabilityAndCompute = mockTestViabilityAndCompute;
    bScheduleUtil.deleteAppointment = mockDeleteAppointment;
    bScheduleUtil.deleteAppointmentBString = mockDeleteAppointmentBString;
    bScheduleUtil.modifyScheduleAndBooking = mockModifyScheduleAndBooking;
    bConversionUtil.convertScheduleToAppointmentSchedule = mockConvertScheduleToAppointmentSchedule;

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it(`should call it's bStringUtil's parseBString when parseBString is called`, () => {
      
      const testArg1: string = '01';
      
      bTimeFactory.parseBString(testArg1);
      
      expect(mockParseBString).toBeCalled();
      expect(mockParseBString).toBeCalledWith(testArg1);
    });

    it(`should call it's bStringUtil's generateBString when generateBString called`, () => {
      
      const testArg1: Appointment = TestUtils.generateSimpleDateAppointment(new Date());
      
      bTimeFactory.generateBString(testArg1);
      
      expect(mockGenerateBString).toBeCalled();
      expect(mockGenerateBString).toBeCalledWith(testArg1);
    });

    it(`should call it's bStringUtil's generateBStringFromAppointments when generateBStringFromAppointments called`, () => {
      
      const testArg1: Appointment[] = [TestUtils.generateSimpleDateAppointment(new Date())];
      
      bTimeFactory.generateBStringFromAppointments(testArg1);
      
      expect(mockGenerateBStringFromAppointments).toBeCalled();
      expect(mockGenerateBStringFromAppointments).toBeCalledWith(testArg1);
    });

    it(`should call it's bStringUtil's timeStringSplit when timeStringSplit called`, () => {
      bTimeFactory.timeStringSplit(TestUtils.emptyDay());
      
      expect(mockTimeStringSplit).toBeCalled();
      expect(mockTimeStringSplit).toBeCalledWith(TestUtils.emptyDay());
    });

    it(`should call it's bStringUtil's decimalToBString when decimalToBString called`, () => {
      const testNumber: number = 1;
      bTimeFactory.decimalToBString(testNumber);
      
      expect(mockDecimalToBString).toBeCalled();
      expect(mockDecimalToBString).toBeCalledWith(testNumber);
    });

    it(`should call it's bScheduleUtil's testViabilityAndCompute when testViabilityAndCompute called`, () => {
      
      const testArg1: number = 1;
      const testArg2: number = 2;
      
      bTimeFactory.testViabilityAndCompute(testArg1, testArg2);
      
      expect(mockTestViabilityAndCompute).toBeCalled();
      expect(mockTestViabilityAndCompute).toBeCalledWith(testArg1, testArg2);
    });

    it(`should call it's bScheduleUtil's deleteAppointment when deleteAppointment called`, () => {
      
      const testArg1: Appointment = TestUtils.generateSimpleDateAppointment(new Date());
      const testArg2: string = '00';
      
      bTimeFactory.deleteAppointment(testArg1, testArg2);
      
      expect(mockDeleteAppointment).toBeCalled();
      expect(mockDeleteAppointment).toBeCalledWith(testArg1, testArg2);
    });

    it(`should call it's bScheduleUtil's deleteAppointmentBString when deleteAppointmentBString called`, () => {
      
      const testArg1: string = '01';
      const testArg2: string = '00';
      
      bTimeFactory.deleteAppointmentBString(testArg1, testArg2);
      
      expect(mockDeleteAppointmentBString).toBeCalled();
      expect(mockDeleteAppointmentBString).toBeCalledWith(testArg1, testArg2);
    });

    it(`should call it's bScheduleUtil's modifyScheduleAndBooking when modifyScheduleAndBooking called`, () => {
      
      const testArg1: string = '001';
      const testArg2: string = '111';
      const testArg3: string = '110';
      
      bTimeFactory.modifyScheduleAndBooking(testArg1, testArg2, testArg3);
      
      expect(mockModifyScheduleAndBooking).toBeCalled();
      expect(mockModifyScheduleAndBooking).toBeCalledWith(testArg1, testArg2, testArg3);
    });

    it(`should call it's bConversionUtils's convertScheduleToAppointmentSchedule when convertScheduleToAppointmentSchedule called`, () => {
        const baseDate: Date = new Date('2020-02-09T00:00:00Z');
        const schedule: Schedule = TestUtils.generateSchedule(
          TestUtils.emptyWeek(),
          TestUtils.emptyWeek(),
          baseDate
        );
        const emptyAvail: string[] = TestUtils.emptyWeek();
      
      bTimeFactory.convertScheduleToAppointmentSchedule(schedule, emptyAvail);
      
      expect(mockConvertScheduleToAppointmentSchedule).toBeCalled();
      expect(mockConvertScheduleToAppointmentSchedule).toBeCalledWith(schedule, emptyAvail);
    });
  });
});