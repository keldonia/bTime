import { Scheduler } from './../src';
import * as TestUtils from './utils/testUtils';
import { MomentAppointment } from '../src/@types';

describe('Test Scheduler', () => {

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