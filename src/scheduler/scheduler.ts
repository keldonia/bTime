import * as moment from 'moment';
import { MomentAppointment, Schedule, daysInWeek, ScheduleActions } from '../@types';
import { BinaryTimeFactory } from '../binaryTime';

/**
 *  @typedef Scheduler Allows for maintaining of scheduling using
 *  binary Scheduler
 *
 *  @param {number} timeInterval the smallest discrete time interval
 *  NB: The time interval must be a factor of 60,
 *      ie. 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, or 60
 *
 *  @returns {Scheduler} Scheduler
 */
export class Scheduler {
  private binaryTimeFactory?: BinaryTimeFactory;

  /**
   *  @description Scheduler Allows for maintaining of scheduling using
   *  binary Scheduler
   *
   *  @param {number} timeInterval the smallest discrete time interval
   *  NB: The time interval must be a factor of 60,
   *      ie. 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, or 60
   *
   *  @returns {Scheduler} Scheduler
   */
  constructor(timeInterval: number) {
    this.binaryTimeFactory = new BinaryTimeFactory(timeInterval);
  }

  /**
   *  @description Utility function to ensure all times are UTC
   *
   *  @param {MomentAppointment} appointment appointment to convert to UTC
   *
   *  @returns {MomentAppointment} MomentAppointment
   */
  enforceUTC(appointment: MomentAppointment): MomentAppointment {
    const apptStartUtc: moment.Moment = moment(appointment.startTime).utc();
    const appEndUtc: moment.Moment = moment(appointment.endTime).utc();
    const apptObj: MomentAppointment = {
      startTime: apptStartUtc,
      endTime: appEndUtc
    };

    return apptObj;
  }

  /**
   *  @description Tests a propsoed schedule update and updates the schedule, if the
   *  update is valid or false if the update is not valid
   *
   *  @param {Schedule} proposedSchedule
   *  @param {Schedule} schedule
   *
   *  @returns {Schedule | false} Schedule | false
   */
  updateSchedule(proposedSchedule: Schedule, schedule: Schedule): Schedule | false {

    for (let i = 0; i < daysInWeek; i++) {
      // We test that no bookings fall outside of the scheduled availability
      const flippedBookings: number = ~this.binaryTimeFactory.parseBString(schedule.bookings[i]);
      const proposed: string = proposedSchedule.schedule[i];
      const viabile: number | false = this.binaryTimeFactory.testViabilityAndCompute(
        this.binaryTimeFactory.parseBString(proposed),
        flippedBookings
      );

      if (!viabile) {
        return false;
      }

      schedule.schedule[i] = proposed;
    }

    return schedule;
  }

  /**
   *  @description Takes an appointment and update type and tests if the appointment update
   *  is valid, if not it returns false, if it is the schedule is updated
   *
   *  @param {MomentAppointment} appointment
   *  @param {Schedule} schedule
   *  @param {ScheduleActions} actionType
   *
   *  @returns {Schedule | false} Schedule | false
   */
  processAppointment(
    appointment: MomentAppointment,
    schedule: Schedule,
    actionType: ScheduleActions
  ): Schedule | false {
    const crosssesDayBoundary: boolean = this.crosssesDayBoundary(appointment);
    let firstAppt: MomentAppointment;

    if (crosssesDayBoundary) {
      // Clone Appt
      firstAppt = ({
        startTime: appointment.startTime,
        endTime: moment(appointment.startTime).hour(23).minute(59)
      });

      appointment.startTime = moment(appointment.endTime).hour(0).minute(0);
    }

    if (actionType === ScheduleActions.DELETE_APPT) {
      return this.deleteAppointment(appointment, schedule, firstAppt);
    }

    if (actionType === ScheduleActions.BOOKING_UPDATE) {
      return this.handleBookingUpdate(
        appointment,
        schedule,
        firstAppt
      );
    }

    return false;
  }

  /**
   *  @description Takes an appointment and tests if the appointment update
   *  is valid, if not it returns false, if it is the schedule is updated
   *
   *  @param {MomentAppointment} appointment
   *  @param {Schedule} schedule
   *  @param {MomentAppointment?} firstAppt
   *
   *  @returns {Schedule | false} Schedule | false
   */
  handleBookingUpdate(
    appointment: MomentAppointment,
    schedule: Schedule,
    firstAppt?: MomentAppointment
  ): Schedule | false {
    let startDay = appointment.startTime.day();
    const endDay = appointment.endTime.day();

    if (firstAppt) {
      startDay = firstAppt.startTime.day();
      const firstApptBString: string | false = this.binaryTimeFactory.generateBinaryString(firstAppt);

      if (!firstApptBString) {
        return false;
      }

      const tempBookings: string | false = this.binaryTimeFactory.modifyScheduleAndBooking(
        schedule.bookings[startDay],
        schedule.schedule[startDay],
        firstApptBString
      );

      if (!tempBookings) {
        return false;
      }

      schedule.bookings[startDay] = tempBookings;
    }

    const apptBString: string | false = this.binaryTimeFactory.generateBinaryString(appointment);

    if (!apptBString) {
      return false;
    }

    const tempBookings: string | false = this.binaryTimeFactory.modifyScheduleAndBooking(
      schedule.bookings[endDay],
      schedule.schedule[endDay],
      apptBString
    );

    if (!tempBookings) {
      return false;
    }

    schedule.bookings[endDay] = tempBookings;

    return schedule;
  }

  /**
   *  @description Takes an appointment and update type and tests if the appointment delete
   *  is valid, if not it returns false, if it is the schedule is updated to reflect the deletion
   *
   *  @param {MomentAppointment} appointment
   *  @param {Schedule} schedule
   *  @param {MomentAppointment?} firstAppt
   *
   *  @returns {Schedule} Schedule
   */
  deleteAppointment(appointment: MomentAppointment, schedule: Schedule, firstAppt?: MomentAppointment): Schedule {
    let startDay = appointment.startTime.day();
    const endDay = appointment.endTime.day();

    if (firstAppt) {
      startDay = firstAppt.startTime.day();
      schedule.bookings[startDay] = this.binaryTimeFactory.deleteAppointment(
        firstAppt,
        schedule.bookings[startDay]
      );
    }

    schedule.bookings[endDay] = this.binaryTimeFactory.deleteAppointment(
      appointment,
      schedule.bookings[endDay]
    );

    return schedule;
  }

  /**
   *  @description Takes an appointment and checks if the appoint crosses a day boundry
   *
   *  NB: We assume that at most appts cross 1 day boundary
   *
   *  @param {MomentAppointment} appt
   *
   *  @returns {boolean} boolean
   */
  crosssesDayBoundary(appt: MomentAppointment): boolean {
    return (moment.duration(appt.startTime.diff(appt.endTime)).asDays() !== 0);
  }
}