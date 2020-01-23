import { Scheduler } from './../src';
import * as TestUtils from './utils/testUtils';
import { MomentAppointment, Schedule, ScheduleActions, MomentAppointmentDuo } from '../src/@types';
import { BinaryStringUtil } from '../src/binaryTime/binaryStringUtil';
import moment = require('moment');

describe('Test Scheduler', () => {

  describe('#enforceUTC', () => {
    const scheduler: Scheduler = new Scheduler(5);

    it('should properly convert times to utc', () => {
      const apptToBook: MomentAppointment = {
        startTime: moment('2011-10-10T23:30:00Z'),
        endTime: moment('2011-10-11T00:30:00Z')
      };
      const expectedAppt: MomentAppointment = {
        startTime: apptToBook.startTime.clone().utc(),
        endTime: apptToBook.endTime.clone().utc()
      };

      const computedUtcAppt: MomentAppointment = scheduler.enforceUTC(apptToBook);
      
      expect(computedUtcAppt).toMatchObject(expectedAppt);
    });
  });

  describe('#composeAppointments', () => {
    const scheduler: Scheduler = new Scheduler(5);

    it('should properly create the appointmentDuo splitting the appt on the day boundary', () => {
      const apptToBook: MomentAppointment = {
        startTime: moment('2011-10-10T23:30:00Z'),
        endTime: moment('2011-10-11T00:30:00Z')
      };
      const expectedAppt: MomentAppointment = {
        startTime: apptToBook.startTime.clone().utc(),
        endTime: apptToBook.startTime.clone().utc().hour(23).minute(59)
      };
      const expectedSecondAppt: MomentAppointment = {
        startTime: apptToBook.endTime.clone().utc().hour(0).minute(0),
        endTime: apptToBook.endTime.clone().utc()
      };

      const appointmentDuo: MomentAppointmentDuo = scheduler.composeAppointments(apptToBook);

      expect(appointmentDuo.initialAppointment.startTime.utc().isSame(expectedAppt.startTime.utc())).toBeTruthy();
      expect(appointmentDuo.initialAppointment.endTime.utc().isSame(expectedAppt.endTime.utc())).toBeTruthy();
      expect(appointmentDuo.secondAppointment.startTime.utc().isSame(expectedSecondAppt.startTime.utc())).toBeTruthy();
      expect(appointmentDuo.secondAppointment.endTime.utc().isSame(expectedSecondAppt.endTime.utc())).toBeTruthy();
    });
  });

  describe('#updateSchedule', () => {
    const scheduler: Scheduler = new Scheduler(5);
    const emptyBookings: string[] = TestUtils.emptyWeek();

    it('should return the modified schedule if the current bookings are contained within the proposed availability', () => {
      const dayZeroSchedule: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: MomentAppointment = TestUtils.generateMockAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(
        dayZeroSchedule, 
        dayOneSchedule, 
        dayOneSchedule, 
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule
      );

      const dayZeroBookings: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: MomentAppointment = TestUtils.generateMockAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(
        dayZeroBookings, 
        dayOneBookings
      );

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const proposedDayZeroSchedule: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 20, 0, 0, 0);
      const proposedDayOneSchedule: MomentAppointment = TestUtils.generateMockAppointment(9, 0, 18, 0, 0, 0);
      const proposedAvailability: string[] = TestUtils.generateTimeSet(
        proposedDayZeroSchedule, 
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule
      );

      const proposedSchedule: Schedule = TestUtils.generateSchedule(proposedAvailability, emptyBookings);
      
      const expectedSchedule: Schedule = {
        schedule: proposedAvailability,
        bookings: bookings,
        weekStart: schedule.weekStart
      };

      const computedSchedule: Schedule = scheduler.updateSchedule(proposedSchedule, schedule) as Schedule;

      expect(computedSchedule).toMatchObject(expectedSchedule);
    });

    it('should return false if the current bookings are not contained within the proposed availability, empty hour', () => {
      const dayZeroSchedule: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: MomentAppointment = TestUtils.generateMockAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(
        dayZeroSchedule, 
        dayOneSchedule, 
        dayOneSchedule, 
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule
      );

      const dayZeroBookings: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: MomentAppointment = TestUtils.generateMockAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const proposedDayZeroSchedule: MomentAppointment = TestUtils.generateMockAppointment(12, 0, 18, 0, 0, 0);
      const proposedDayOneSchedule: MomentAppointment = TestUtils.generateMockAppointment(9, 0, 18, 0, 0, 0);
      const proposedAvailability: string[] = TestUtils.generateTimeSet(
        proposedDayZeroSchedule, 
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule
      );
      
      const proposedSchedule: Schedule = TestUtils.generateSchedule(proposedAvailability, emptyBookings);

      const computedSchedule: Schedule | boolean = scheduler.updateSchedule(proposedSchedule, schedule);

      expect(computedSchedule).toBeFalsy();
    });

    it('should return false if the current bookings are not contained within the proposed availability, non-empty hour', () => {
      const dayZeroSchedule: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: MomentAppointment = TestUtils.generateMockAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(
        dayZeroSchedule, 
        dayOneSchedule, 
        dayOneSchedule, 
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule
      );

      const dayZeroBookings: MomentAppointment = TestUtils.generateMockAppointment(12, 0, 18, 0, 0, 0);
      const dayOneBookings: MomentAppointment = TestUtils.generateMockAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const proposedDayZeroSchedule: MomentAppointment = TestUtils.generateMockAppointment(12, 30, 18, 0, 0, 0);
      const proposedDayOneSchedule: MomentAppointment = TestUtils.generateMockAppointment(9, 0, 18, 0, 0, 0);
      const proposedAvailability: string[] = TestUtils.generateTimeSet(
        proposedDayZeroSchedule, 
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule
      );
      
      const proposedSchedule: Schedule = TestUtils.generateSchedule(proposedAvailability, emptyBookings);

      const computedSchedule: Schedule | boolean = scheduler.updateSchedule(proposedSchedule, schedule);

      expect(computedSchedule).toBeFalsy();
    });
  });

  describe('#processAppointment', () => {
    const scheduler: Scheduler = new Scheduler(5);
    const mockDeleteAppointment: jest.Mock = jest.fn();
    const mockHandleBookingUpdate: jest.Mock = jest.fn();

    scheduler.deleteAppointment = mockDeleteAppointment;
    scheduler.handleBookingUpdate = mockHandleBookingUpdate;

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should call delete appointment with only one appointment if the appointment does not cross the day boundary', () => {
      const dayZeroSchedule: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: MomentAppointment = TestUtils.generateMockAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: MomentAppointment = TestUtils.generateMockAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);
      const apptToBook: MomentAppointment = TestUtils.generateMockAppointment(10,0, 11, 0, 1, 1);

      const actionType: ScheduleActions = ScheduleActions.BOOKING_UPDATE;

      scheduler.processAppointment(apptToBook, schedule, actionType);

      expect(mockHandleBookingUpdate).toBeCalledWith(apptToBook, schedule, undefined);
    });

    it('should call handleBookingUpdate with two appointments if the appointment crosses the day boundary', () => {
      const dayZeroSchedule: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: MomentAppointment = TestUtils.generateMockAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: MomentAppointment = TestUtils.generateMockAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);
      const apptToBook: MomentAppointment = {
        startTime: moment('2011-10-10T23:30:00Z'),
        endTime: moment('2011-10-11T00:30:00Z')
      };
      const actionType: ScheduleActions = ScheduleActions.BOOKING_UPDATE;

      const expectedAppt: MomentAppointment = {
        startTime: moment(apptToBook.startTime).clone().utc(),
        endTime: moment(apptToBook.startTime).clone().utc().hour(23).minute(59)
      };
      const expectedSecondAppt: MomentAppointment = {
        startTime: moment(apptToBook.endTime).clone().utc().hour(0).minute(0),
        endTime: moment(apptToBook.endTime).clone().utc()
      };

      scheduler.processAppointment(apptToBook, schedule, actionType);

      expect(mockHandleBookingUpdate).toBeCalledWith(expectedAppt, schedule, expectedSecondAppt);
    });

    it('should call handleBookingUpdate with only one appointment if the appointment does not cross the day boundary', () => {
      const dayZeroSchedule: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: MomentAppointment = TestUtils.generateMockAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: MomentAppointment = TestUtils.generateMockAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);
      const apptToBook: MomentAppointment = TestUtils.generateMockAppointment(10,0, 11, 0, 1, 1);

      const actionType: ScheduleActions = ScheduleActions.DELETE_APPT;

      scheduler.processAppointment(apptToBook, schedule, actionType);

      expect(mockDeleteAppointment).toBeCalledWith(apptToBook, schedule, undefined);
    });

    it('should call delete appointment with two appointments if the appointment crosses the day boundary', () => {
      const dayZeroSchedule: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: MomentAppointment = TestUtils.generateMockAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: MomentAppointment = TestUtils.generateMockAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);
      const apptToBook: MomentAppointment = {
        startTime: moment('2011-10-10T23:30:00Z'),
        endTime: moment('2011-10-11T00:30:00Z')
      };
      const actionType: ScheduleActions = ScheduleActions.DELETE_APPT;

      const expectedAppt: MomentAppointment = {
        startTime: moment(apptToBook.startTime).clone().utc(),
        endTime: moment(apptToBook.startTime).clone().utc().hour(23).minute(59)
      };
      const expectedSecondAppt: MomentAppointment = {
        startTime: moment(apptToBook.endTime).clone().utc().hour(0).minute(0),
        endTime: moment(apptToBook.endTime).clone().utc()
      };

      scheduler.processAppointment(apptToBook, schedule, actionType);

      expect(mockDeleteAppointment).toBeCalledWith(expectedAppt, schedule, expectedSecondAppt);
    });

    it('should return false if passed an invalid action type', () => {
      const dayZeroSchedule: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: MomentAppointment = TestUtils.generateMockAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: MomentAppointment = TestUtils.generateMockAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);
      const apptToBook: MomentAppointment = TestUtils.generateMockAppointment(10, 0, 11, 0, 1, 1);
      // This is a deliberate cast to break the type
      const actionType: ScheduleActions = 'NOT_A_SCHEDULE_ACTION' as unknown as ScheduleActions;

      const computedSchedule: Schedule | false = scheduler.processAppointment(apptToBook, schedule, actionType);

      expect(computedSchedule).toBeFalsy();
    });
  });

  describe('#handleBookingUpdate',  () => {
    const scheduler: Scheduler = new Scheduler(5);
    const binaryStringUtil: BinaryStringUtil = new BinaryStringUtil(5);

    it(`should handle an appointment that doesn't cross the day boundary`, () => {
      const dayZeroSchedule: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: MomentAppointment = TestUtils.generateMockAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: MomentAppointment = TestUtils.generateMockAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const apptToBook: MomentAppointment = TestUtils.generateMockAppointment(10, 0, 11, 0, 1, 1);

      const dayOneExpectedBookings: MomentAppointment = TestUtils.generateMockAppointment(10, 0, 17, 0, 1, 1);
      const expectedBookings: string = binaryStringUtil.generateBinaryString(dayOneExpectedBookings) as string;

      const computedSchedule: Schedule = scheduler.handleBookingUpdate(apptToBook, schedule) as Schedule;

      // Only needs to test that the bookings on the appropriate day was correctly modified
      expect(computedSchedule.bookings[1]).toEqual(expectedBookings);
    });

    it('should return false if the appointment passed is not valid', () => {
      const dayZeroSchedule: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 23, 59, 0, 0);
      const dayOneSchedule: MomentAppointment = TestUtils.generateMockAppointment(0, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 23, 0, 0, 0);
      const dayOneBookings: MomentAppointment = TestUtils.generateMockAppointment(1, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const apptToBook: MomentAppointment = TestUtils.generateMockAppointment(12, 0, 2, 0, 1, 1);

      const computedSchedule: Schedule | false = scheduler.handleBookingUpdate(apptToBook, schedule);

      expect(computedSchedule).toBeFalsy();
    });

    it('should return false if the appointment passed does not fit in the schedule', () => {
      const dayZeroSchedule: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 23, 59, 0, 0);
      const dayOneSchedule: MomentAppointment = TestUtils.generateMockAppointment(0, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 23, 0, 0, 0);
      const dayOneBookings: MomentAppointment = TestUtils.generateMockAppointment(1, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const apptToBook: MomentAppointment = TestUtils.generateMockAppointment(0, 0, 2, 0, 1, 1);

      const computedSchedule: Schedule | false = scheduler.handleBookingUpdate(apptToBook, schedule);

      expect(computedSchedule).toBeFalsy();
    });

    it(`should handle an appointment that does cross the day boundary`, () => {
      const dayZeroSchedule: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 23, 59, 0, 0);
      const dayOneSchedule: MomentAppointment = TestUtils.generateMockAppointment(0, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 23, 0, 0, 0);
      const dayOneBookings: MomentAppointment = TestUtils.generateMockAppointment(1, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const firstApptToBook: MomentAppointment = TestUtils.generateMockAppointment(23, 0, 23, 59, 0, 0);
      const apptToBook: MomentAppointment = TestUtils.generateMockAppointment(0, 0, 1, 0, 1, 1);

      const dayZeroExpectedBookings: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 23, 59, 0, 0);
      const expectedDayZeroBookings: string = binaryStringUtil.generateBinaryString(dayZeroExpectedBookings) as string;

      const dayOneExpectedBookings: MomentAppointment = TestUtils.generateMockAppointment(0, 0, 17, 0, 1, 1);
      const expectedDayOneBookings: string = binaryStringUtil.generateBinaryString(dayOneExpectedBookings) as string;

      const computedSchedule: Schedule = scheduler.handleBookingUpdate(apptToBook, schedule, firstApptToBook) as Schedule;

      // Only needs to test that the bookings on the appropriate days were correctly modified
      expect(computedSchedule.bookings[0]).toEqual(expectedDayZeroBookings);
      expect(computedSchedule.bookings[1]).toEqual(expectedDayOneBookings);
    });

    it('should return false if a firstAppt is passed not a valid appointment', () => {
      const dayZeroSchedule: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 23, 59, 0, 0);
      const dayOneSchedule: MomentAppointment = TestUtils.generateMockAppointment(0, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 23, 0, 0, 0);
      const dayOneBookings: MomentAppointment = TestUtils.generateMockAppointment(1, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const firstApptToBook: MomentAppointment = TestUtils.generateMockAppointment(23, 59, 23, 0, 0, 0);
      const apptToBook: MomentAppointment = TestUtils.generateMockAppointment(0, 0, 1, 0, 1, 1);

      const computedSchedule: Schedule | false = scheduler.handleBookingUpdate(apptToBook, schedule, firstApptToBook);

      expect(computedSchedule).toBeFalsy();
    });

    it('should return false if a firstAppt passed does not fit in the schedule', () => {
      const dayZeroSchedule: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 23, 0, 0, 0);
      const dayOneSchedule: MomentAppointment = TestUtils.generateMockAppointment(0, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 23, 0, 0, 0);
      const dayOneBookings: MomentAppointment = TestUtils.generateMockAppointment(1, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const firstApptToBook: MomentAppointment = TestUtils.generateMockAppointment(23, 0, 23, 59, 0, 0);
      const apptToBook: MomentAppointment = TestUtils.generateMockAppointment(0, 0, 1, 0, 1, 1);

      const computedSchedule: Schedule | false = scheduler.handleBookingUpdate(apptToBook, schedule, firstApptToBook);

      expect(computedSchedule).toBeFalsy();
    });
  });

  describe('#deleteAppointment', () => {
    const scheduler: Scheduler = new Scheduler(5);
    const binaryStringUtil: BinaryStringUtil = new BinaryStringUtil(5);

    it(`should handle an appointment that doesn't cross the day boundary`, () => {
      const dayZeroSchedule: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: MomentAppointment = TestUtils.generateMockAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: MomentAppointment = TestUtils.generateMockAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const apptToDelete: MomentAppointment = TestUtils.generateMockAppointment(11,0, 12, 0, 1, 1);

      const dayOneExpectedBookings: MomentAppointment = TestUtils.generateMockAppointment(12, 0, 17, 0, 1, 1);
      const expectedBookings: string = binaryStringUtil.generateBinaryString(dayOneExpectedBookings) as string;

      const computedSchedule: Schedule = scheduler.deleteAppointment(apptToDelete, schedule);

      // Only needs to test that the bookings on the appropriate day was correctly modified
      expect(computedSchedule.bookings[1]).toEqual(expectedBookings);
    });

    it(`should handle an appointment that does cross the day boundary`, () => {
      const dayZeroSchedule: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 23, 59, 0, 0);
      const dayOneSchedule: MomentAppointment = TestUtils.generateMockAppointment(0, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 23, 59, 0, 0);
      const dayOneBookings: MomentAppointment = TestUtils.generateMockAppointment(0, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const firstApptToDelete: MomentAppointment = TestUtils.generateMockAppointment(23,0, 23, 59, 0, 0);
      const apptToDelete: MomentAppointment = TestUtils.generateMockAppointment(0, 0, 1, 0, 1, 1);

      const dayZeroExpectedBookings: MomentAppointment = TestUtils.generateMockAppointment(8, 0, 23, 0, 0, 0);
      const expectedDayZeroBookings: string = binaryStringUtil.generateBinaryString(dayZeroExpectedBookings) as string;

      const dayOneExpectedBookings: MomentAppointment = TestUtils.generateMockAppointment(1, 0, 17, 0, 1, 1);
      const expectedDayOneBookings: string = binaryStringUtil.generateBinaryString(dayOneExpectedBookings) as string;

      const computedSchedule: Schedule = scheduler.deleteAppointment(apptToDelete, schedule, firstApptToDelete);

      // Only needs to test that the bookings on the appropriate days were correctly modified
      expect(computedSchedule.bookings[0]).toEqual(expectedDayZeroBookings);
      expect(computedSchedule.bookings[1]).toEqual(expectedDayOneBookings);
    });
  });

  describe('#crossesDayBoundary', () => {
    const scheduler: Scheduler = new Scheduler(5);

    it('returns false if an appointment does not cross the day boundary', () => {
      const mommentAppt: MomentAppointment = TestUtils.generateSimpleMomentAppointment(new Date('2011-10-10T10:48:00Z'));
      const crossesDayBoundary: boolean = scheduler.crosssesDayBoundary(mommentAppt);
     
      expect(crossesDayBoundary).toBeFalsy();
    });

    it('returns true if an appointment does cross the day boundary', () => {
      const mommentAppt: MomentAppointment = TestUtils.generateSimpleMomentAppointment(new Date('2011-10-10T23:48:00Z'));
      const crossesDayBoundary: boolean = scheduler.crosssesDayBoundary(mommentAppt);

      expect(crossesDayBoundary).toBeTruthy();
    });
  });
});