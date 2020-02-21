import * as TestUtils from './utils/testUtils';
import { BinaryTimeFactory } from './../src/binaryTime/index';
import { ScheduleBinaryUtil } from '../src/binaryTime/scheduleBinaryUtil';
import { BinaryStringUtil } from '../src/binaryTime/binaryStringUtil';
import { Appointment } from '../src/@types';

describe('Binary Time Factory', () => {
  describe('constructor', () => {
    it('should throw an error if an valid time interval is supplied: 3', () => {
      const timeInterval: number = 3;
      function test() {
        new BinaryTimeFactory(timeInterval);
      };

      expect(test).not.toThrow();
    });

    it('should throw an error if an valid time interval is supplied: 5', () => {
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
    
    const mockParseBString: jest.Mock = jest.fn();
    const mockGenerateBinaryString: jest.Mock = jest.fn();
    const mockTimeStringSplit: jest.Mock = jest.fn();
    const mockDecimalToBinaryString: jest.Mock = jest.fn();
    const mockTestViabilityAndCompute: jest.Mock = jest.fn();
    const mockDeleteAppointment: jest.Mock = jest.fn();
    const mockModifyScheduleAndBooking: jest.Mock = jest.fn();

    binaryStringUtil.parseBString = mockParseBString;
    binaryStringUtil.generateBinaryString = mockGenerateBinaryString;
    binaryStringUtil.timeStringSplit = mockTimeStringSplit;
    binaryStringUtil.decimalToBinaryString = mockDecimalToBinaryString;
    scheduleBinaryUtil.testViabilityAndCompute = mockTestViabilityAndCompute;
    scheduleBinaryUtil.deleteAppointment = mockDeleteAppointment;
    scheduleBinaryUtil.modifyScheduleAndBooking = mockModifyScheduleAndBooking;

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it(`should call it's binaryStringUtil's parseBString 
      when parseBString is called`, () => {
      
      const testArg1: string = '01';
      
      binaryTimeFactory.parseBString(testArg1);
      
      expect(mockParseBString).toBeCalled();
      expect(mockParseBString).toBeCalledWith(testArg1);
    });

    it(`should call it's binaryStringUtil's generateBinaryString 
      when generateBinaryString called`, () => {
      
      const testArg1: Appointment = TestUtils.generateSimpleDateAppointment(new Date());
      
      binaryTimeFactory.generateBinaryString(testArg1);
      
      expect(mockGenerateBinaryString).toBeCalled();
      expect(mockGenerateBinaryString).toBeCalledWith(testArg1);
    });

    it(`should call it's binaryStringUtil's timeStringSplit 
      when timeStringSplit called`, () => {
      binaryTimeFactory.timeStringSplit(TestUtils.emptyDay());
      
      expect(mockTimeStringSplit).toBeCalled();
      expect(mockTimeStringSplit).toBeCalledWith(TestUtils.emptyDay());
    });

    it(`should call it's binaryStringUtil's decimalToBinaryString 
      when decimalToBinaryString called`, () => {
      const testNumber: number = 1;
      binaryTimeFactory.decimalToBinaryString(testNumber);
      
      expect(mockDecimalToBinaryString).toBeCalled();
      expect(mockDecimalToBinaryString).toBeCalledWith(testNumber);
    });

    it(`should call it's scheduleBinaryUtil's testViabilityAndCompute 
      when testViabilityAndCompute called`, () => {
      
      const testArg1: number = 1;
      const testArg2: number = 2;
      
      binaryTimeFactory.testViabilityAndCompute(testArg1, testArg2);
      
      expect(mockTestViabilityAndCompute).toBeCalled();
      expect(mockTestViabilityAndCompute).toBeCalledWith(testArg1, testArg2);
    });

    it(`should call it's scheduleBinaryUtil's deleteAppointment 
      when deleteAppointment called`, () => {
      
      const testArg1: Appointment = TestUtils.generateSimpleDateAppointment(new Date());
      const testArg2: string = '00';
      
      binaryTimeFactory.deleteAppointment(testArg1, testArg2);
      
      expect(mockDeleteAppointment).toBeCalled();
      expect(mockDeleteAppointment).toBeCalledWith(testArg1, testArg2);
    });

    it(`should call it's scheduleBinaryUtil's modifyScheduleAndBooking 
      when modifyScheduleAndBooking called`, () => {
      
      const testArg1: string = '001';
      const testArg2: string = '111';
      const testArg3: string = '110';
      
      binaryTimeFactory.modifyScheduleAndBooking(testArg1, testArg2, testArg3);
      
      expect(mockModifyScheduleAndBooking).toBeCalled();
      expect(mockModifyScheduleAndBooking).toBeCalledWith(testArg1, testArg2, testArg3);
    });
  });
});