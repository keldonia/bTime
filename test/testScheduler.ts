import { Scheduler } from './../src';
import * as TestUtils from './utils/testUtils';
import { MomentAppointment, Schedule } from '../src/@types';
import { BinaryStringUtil } from '../src/binaryTime/binaryStringUtil';

describe('Test Scheduler', () => {

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

      expect(crossesDayBoundary).toBeFalsy();
    });
  });
});