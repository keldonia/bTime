import * as TestUtils from './utils/testUtils';
import { BinaryTimeFactory } from './../src/binaryTime/index';
import { ScheduleBinaryUtil } from '../src/binaryTime/scheduleBinaryUtil';
import { BinaryStringUtil } from '../src/binaryTime/binaryStringUtil';
import { Appointment, Schedule } from '../src/@types';
import { BinaryConversionUtil } from '../src/binaryTime/binaryConversionUtil';

describe('Binary Time Factory', () => {
  describe('constructor', () => {
    it('should not throw an error if an valid time interval is supplied: 3', () => {
      const timeInterval: number = 3;
      function test() {
        new BinaryTimeFactory(timeInterval);
      };

      expect(test).not.toThrow();
    });

    it('should not throw an error if an valid time interval is supplied: 5', () => {
      const timeInterval: number = 5;
      function test() {
        new BinaryTimeFactory(timeInterval);
      };

      expect(test).not.toThrow();
    });

    it('should throw an error if an invalid time interval is supplied: 7', () => {
      const timeInterval: number = 7;
      function test() {
        new BinaryTimeFactory(timeInterval);
      };

      expect(test).toThrow(`Invalid timeInterval entered for BinaryTimeFactory: ${timeInterval}`);
    });
  });

  describe('test pass-through methods', () => {
    const binaryTimeFactory: BinaryTimeFactory = new BinaryTimeFactory(5);
    const scheduleBinaryUtil: ScheduleBinaryUtil = binaryTimeFactory['scheduleBinaryUtil'];
    const binaryStringUtil: BinaryStringUtil = binaryTimeFactory['binaryStringUtil'];
    const binaryConversionUtil: BinaryConversionUtil = binaryTimeFactory['binaryConversionUtil'];
    
    const mockParseBString: jest.Mock = jest.fn();
    const mockGenerateBinaryString: jest.Mock = jest.fn();
    const mockGenerateBinaryStringFromAppointments: jest.Mock = jest.fn();
    const mockTimeStringSplit: jest.Mock = jest.fn();
    const mockDecimalToBinaryString: jest.Mock = jest.fn();
    const mockTestViabilityAndCompute: jest.Mock = jest.fn();
    const mockDeleteAppointment: jest.Mock = jest.fn();
    const mockDeleteAppointmentBString: jest.Mock = jest.fn();
    const mockModifyScheduleAndBooking: jest.Mock = jest.fn();
    const mockConvertScheduleToAppointmentSchedule: jest.Mock = jest.fn();

    binaryStringUtil.parseBString = mockParseBString;
    binaryStringUtil.generateBinaryString = mockGenerateBinaryString;
    binaryStringUtil.generateBinaryStringFromAppointments = mockGenerateBinaryStringFromAppointments;
    binaryStringUtil.timeStringSplit = mockTimeStringSplit;
    binaryStringUtil.decimalToBinaryString = mockDecimalToBinaryString;
    scheduleBinaryUtil.testViabilityAndCompute = mockTestViabilityAndCompute;
    scheduleBinaryUtil.deleteAppointment = mockDeleteAppointment;
    scheduleBinaryUtil.deleteAppointmentBString = mockDeleteAppointmentBString;
    scheduleBinaryUtil.modifyScheduleAndBooking = mockModifyScheduleAndBooking;
    binaryConversionUtil.convertScheduleToAppointmentSchedule = mockConvertScheduleToAppointmentSchedule;

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it(`should call it's binaryStringUtil's parseBString when parseBString is called`, () => {
      
      const testArg1: string = '01';
      
      binaryTimeFactory.parseBString(testArg1);
      
      expect(mockParseBString).toBeCalled();
      expect(mockParseBString).toBeCalledWith(testArg1);
    });

    it(`should call it's binaryStringUtil's generateBinaryString when generateBinaryString called`, () => {
      
      const testArg1: Appointment = TestUtils.generateSimpleDateAppointment(new Date());
      
      binaryTimeFactory.generateBinaryString(testArg1);
      
      expect(mockGenerateBinaryString).toBeCalled();
      expect(mockGenerateBinaryString).toBeCalledWith(testArg1);
    });

    it(`should call it's binaryStringUtil's generateBinaryStringFromAppointments when generateBinaryStringFromAppointments called`, () => {
      
      const testArg1: Appointment[] = [TestUtils.generateSimpleDateAppointment(new Date())];
      
      binaryTimeFactory.generateBinaryStringFromAppointments(testArg1);
      
      expect(mockGenerateBinaryStringFromAppointments).toBeCalled();
      expect(mockGenerateBinaryStringFromAppointments).toBeCalledWith(testArg1);
    });

    it(`should call it's binaryStringUtil's timeStringSplit when timeStringSplit called`, () => {
      binaryTimeFactory.timeStringSplit(TestUtils.emptyDay());
      
      expect(mockTimeStringSplit).toBeCalled();
      expect(mockTimeStringSplit).toBeCalledWith(TestUtils.emptyDay());
    });

    it(`should call it's binaryStringUtil's decimalToBinaryString when decimalToBinaryString called`, () => {
      const testNumber: number = 1;
      binaryTimeFactory.decimalToBinaryString(testNumber);
      
      expect(mockDecimalToBinaryString).toBeCalled();
      expect(mockDecimalToBinaryString).toBeCalledWith(testNumber);
    });

    it(`should call it's scheduleBinaryUtil's testViabilityAndCompute when testViabilityAndCompute called`, () => {
      
      const testArg1: number = 1;
      const testArg2: number = 2;
      
      binaryTimeFactory.testViabilityAndCompute(testArg1, testArg2);
      
      expect(mockTestViabilityAndCompute).toBeCalled();
      expect(mockTestViabilityAndCompute).toBeCalledWith(testArg1, testArg2);
    });

    it(`should call it's scheduleBinaryUtil's deleteAppointment when deleteAppointment called`, () => {
      
      const testArg1: Appointment = TestUtils.generateSimpleDateAppointment(new Date());
      const testArg2: string = '00';
      
      binaryTimeFactory.deleteAppointment(testArg1, testArg2);
      
      expect(mockDeleteAppointment).toBeCalled();
      expect(mockDeleteAppointment).toBeCalledWith(testArg1, testArg2);
    });

    it(`should call it's scheduleBinaryUtil's deleteAppointmentBString when deleteAppointmentBString called`, () => {
      
      const testArg1: string = '01';
      const testArg2: string = '00';
      
      binaryTimeFactory.deleteAppointmentBString(testArg1, testArg2);
      
      expect(mockDeleteAppointmentBString).toBeCalled();
      expect(mockDeleteAppointmentBString).toBeCalledWith(testArg1, testArg2);
    });

    it(`should call it's scheduleBinaryUtil's modifyScheduleAndBooking when modifyScheduleAndBooking called`, () => {
      
      const testArg1: string = '001';
      const testArg2: string = '111';
      const testArg3: string = '110';
      
      binaryTimeFactory.modifyScheduleAndBooking(testArg1, testArg2, testArg3);
      
      expect(mockModifyScheduleAndBooking).toBeCalled();
      expect(mockModifyScheduleAndBooking).toBeCalledWith(testArg1, testArg2, testArg3);
    });

    it(`should call it's binaryConversionUtils's convertScheduleToAppointmentSchedule when convertScheduleToAppointmentSchedule called`, () => {
        const baseDate: Date = new Date('2020-02-09T00:00:00Z');
        const schedule: Schedule = TestUtils.generateSchedule(
          TestUtils.emptyWeek(),
          TestUtils.emptyWeek(),
          baseDate
        );
        const emptyAvail: string[] = TestUtils.emptyWeek();
      
      binaryTimeFactory.convertScheduleToAppointmentSchedule(schedule, emptyAvail);
      
      expect(mockConvertScheduleToAppointmentSchedule).toBeCalled();
      expect(mockConvertScheduleToAppointmentSchedule).toBeCalledWith(schedule, emptyAvail);
    });
  });
});