import {
  Schedule,
  ScheduleActions,
  daysInWeek,
  Appointment,
  AppointmentDuo,
  hoursInDay,
  AppointmentSchedule
} from '../@types';
import { BTimeFactory } from '../bTime';
import { DateUtil } from '../utils';

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
  private bTimeFactory?: BTimeFactory;

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
    this.bTimeFactory = new BTimeFactory(timeInterval);
  }

  /**
   *  @description Takes a schedule and converts into an array of appointments for each date
   *
   *  NB: This is a passthrough to the configured BTimeFactory
   *
   *  @param {Schedule} schedule schedule to generate base Date objects
   *
   *  @returns {AppointmentSchedule} AppointmentSchedule
   */
  public convertScheduleToAppointmentSchedule(schedule: Schedule): AppointmentSchedule {
    const availability: string[] | false = this.getCurrentAvailability(schedule);

    // NB: This should only be triggered by a malformed schedule
    if (!availability) {
      throw new Error(
        `Was unable to convert schedule to appointment schedule, as the bookings do not fit in the schedule`
      );
    }

    return this.bTimeFactory.convertScheduleToAppointmentSchedule(
      schedule,
      availability
    );
  }

  /**
   *  @description Utility function to split appointments that cross
   *  the day boundary
   *
   *  @param {Appointment} appointment Appointment to split
   *
   *  @returns {AppointmentDuo} AppointmentDuo
   */
  public composeAppointments(appointment: Appointment): AppointmentDuo {
    const utcAppt: Appointment = DateUtil.getInstance().enforceUTC(appointment);
    const utcStartTime: Date = utcAppt.startTime;
    const utcEndTime: Date = utcAppt.endTime;

    // Clone Appt
    const initialAppointment: Appointment = {
      startTime: utcStartTime,
      endTime: DateUtil.getInstance().getUtcDateEnd(utcStartTime)
    };

    const secondAppointment: Appointment = {
      startTime: DateUtil.getInstance().getUtcDateStart(utcEndTime),
      endTime: utcEndTime
    };

    return {
      initialAppointment,
      secondAppointment
    };
  }

  /**
   *  @description Takes a valid schedule and computes the remaining availability
   *  based on the total availability and current bookings, returns false if an
   *  invalid scehdule is passed
   *
   *  @param {Schedule} schedule
   *
   *  @returns {string[] | false} string[] | false
   */
  public getCurrentAvailability(schedule: Schedule): string[] | false {
    const totalRemainingAvailability: string[] = [];
    for (let i = 0; i < daysInWeek; i++) {
      // We test that no bookings fall outside of the scheduled availability
      const availability: string = schedule.schedule[i];
      const splitBookings: string[] = this.bTimeFactory.timeStringSplit(schedule.bookings[i]);
      const splitAvailability: string[] = this.bTimeFactory.timeStringSplit(availability);
      const calculatedAvailability: string[] = [];

      for (let j = 0; j < splitBookings.length; j++) {
        const flippedBAvailabiltyInterval: number = ~this.bTimeFactory.parseBString(splitAvailability[j]);
        const bBookingInterval: number = this.bTimeFactory.parseBString(splitBookings[j]);
        const remainingAvailabilityMask: number | false = this.bTimeFactory.testViabilityAndCompute(
          flippedBAvailabiltyInterval,
          bBookingInterval
        );

        if (!remainingAvailabilityMask) {
          return false;
        }

        const remainingAvailability: number = ~remainingAvailabilityMask;

        calculatedAvailability.push(this.bTimeFactory.decimalToBString(remainingAvailability));
      }

      totalRemainingAvailability.push(calculatedAvailability.join(''));
    }

    return totalRemainingAvailability;
  }

  /**
   *  @description Tests a propsoed appointment schedule update and updates the
   *  schedule, if theupdate is valid or returns false if the update is not valid
   *
   *  @param {AppointmentSchedule} proposedAppointmentSchedule proposed schedule
   *  @param {Schedule} schedule current schedule
   *
   *  @returns {AppointmentSchedule | false} AppointmentSchedule | false
   */
  public updateScheduleWithAppointmentSchedule(
    proposedAppointmentSchedule: AppointmentSchedule,
    schedule: Schedule
  ): AppointmentSchedule | false {
    const scheduleAppointments: Appointment[] = [];
    proposedAppointmentSchedule.schedule.forEach(appointments  => {
      appointments.forEach(appointment => {
        scheduleAppointments.push(appointment);
      });
    });
    const proposedScheduleStrings: string[] | false =
      this.bTimeFactory.generateBStringFromAppointments(scheduleAppointments);

    if  (!proposedScheduleStrings) {
      return false;
    }

    const proposedSchedule: Schedule = {
      schedule: proposedScheduleStrings,
      bookings: schedule.bookings,
      weekStart: schedule.weekStart
    };
    const updatedSchedule: Schedule | false = this.updateSchedule(proposedSchedule, schedule);

    if (!updatedSchedule) {
      return false;
    }
    const availability: string[] | false = this.getCurrentAvailability(schedule);

    // NB: This is an additional safe guard
    if (!availability) {
      return false;
    }

    return this.bTimeFactory.convertScheduleToAppointmentSchedule(updatedSchedule, availability);
  }

  /**
   *  @description Tests a propsoed schedule update and updates the schedule,
   *  if the update is valid or returns false if the update is not valid
   *
   *  @param {Schedule} proposedSchedule proposed schedule
   *  @param {Schedule} schedule current schedule
   *
   *  @returns {Schedule | false} Schedule | false
   */
  public updateSchedule(proposedSchedule: Schedule, schedule: Schedule): Schedule | false {
    for (let i = 0; i < daysInWeek; i++) {
      // We test that no bookings fall outside of the scheduled availability
      const proposed: string = proposedSchedule.schedule[i];
      const splitBookings: string[] = this.bTimeFactory.timeStringSplit(schedule.bookings[i]);
      const splitProposed: string[] = this.bTimeFactory.timeStringSplit(proposed);

      for (let j = 0; j < hoursInDay; j++) {
        const bBookingInterval: number = this.bTimeFactory.parseBString(splitBookings[j]);
        const flippedProposedInterval: number = ~this.bTimeFactory.parseBString(splitProposed[j]);

        const viabile: number | false = this.bTimeFactory.testViabilityAndCompute(
          flippedProposedInterval,
          bBookingInterval
        );

        if (!viabile) {
          return false;
        }
      }

      proposedSchedule.schedule[i] = splitProposed.slice(0, hoursInDay).join('');
      schedule.bookings[i] = splitBookings.slice(0, hoursInDay).join('');
    }

    schedule.schedule = proposedSchedule.schedule;

    return schedule;
  }

  /**
   *  @description Takes an array of appointments and update type and tests if
   *  the appointment updates are valid, if not it returns false, if they are
   *  the schedule is updated
   *
   *  @param {Appointment[]} appointments appointments to process
   *  @param {Schedule} schedule schedule for appointments to be applied
   *  @param {ScheduleActions} actionType determines how to process appointment
   *
   *  @returns {Schedule | false} Schedule | false
   */
  public processAppointments(
    appointments: Appointment[],
    schedule: Schedule,
    actionType: ScheduleActions
  ): Schedule | false {
    const appointmentsBStrings: string[] | false = this.bTimeFactory.generateBStringFromAppointments(appointments);

    if (!appointmentsBStrings) {
      return false;
    }

    if (actionType === ScheduleActions.DELETE_APPT) {
      return this.deleteAppointments(appointmentsBStrings, schedule);
    }

    if (actionType === ScheduleActions.BOOKING_UPDATE) {
      return this.handleBookingUpdateBString(appointmentsBStrings, schedule);
    }

    return false;
  }

  /**
   *  @description Takes an appointment and update type and tests if the
   *  appointment update is valid, if not it returns false, if it is the
   *  schedule is updated
   *
   *  @param {Appointment} appointment appointment to process
   *  @param {Schedule} schedule schedule for appointments to be applied
   *  @param {ScheduleActions} actionType determines how to process appointment
   *
   *  @returns {Schedule | false} Schedule | false
   */
  public processAppointment(
    appointment: Appointment,
    schedule: Schedule,
    actionType: ScheduleActions
  ): Schedule | false {
    const crosssesDayBoundary: boolean = DateUtil.getInstance().crosssesDayBoundary(appointment);
    let firstAppt: Appointment;

    if (crosssesDayBoundary) {
      const appointmentDuo: AppointmentDuo = this.composeAppointments(appointment);

      firstAppt = appointmentDuo.secondAppointment;
      appointment = appointmentDuo.initialAppointment;
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
   *  @param {Appointment} appointment appointment to test
   *  @param {Schedule} schedule schedule to test against
   *  @param {Appointment?} firstAppt — optional additional appointment to
   *  process if Appointment crosses date boundary
   *
   *  @returns {Schedule | false} Schedule | false
   */
  public handleBookingUpdate(
    appointment: Appointment,
    schedule: Schedule,
    firstAppt?: Appointment
  ): Schedule | false {
    let startDay = appointment.startTime.getUTCDay();
    const endDay = appointment.endTime.getUTCDay();

    if (firstAppt) {
      startDay = firstAppt.startTime.getUTCDay();
      const firstApptBString: string | false = this.bTimeFactory.generateBString(firstAppt);

      if (!firstApptBString) {
        return false;
      }

      const tempBookings: string | false = this.bTimeFactory.modifyScheduleAndBooking(
        schedule.bookings[startDay],
        schedule.schedule[startDay],
        firstApptBString
      );

      if (!tempBookings) {
        return false;
      }

      schedule.bookings[startDay] = tempBookings;
    }

    const apptBString: string | false = this.bTimeFactory.generateBString(appointment);

    if (!apptBString) {
      return false;
    }

    const tempBookings: string | false = this.bTimeFactory.modifyScheduleAndBooking(
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
   *  @description Takes an array of appointments and tests if the appointment
   *  update are valid, if not it returns false, if they are the schedule is updated
   *
   *  @param {string[]} appointments appointments to test
   *  @param {Schedule} schedule schedule to test against
   *
   *  @returns {Schedule | false} Schedule | false
   */
  public handleBookingUpdateBString(
    appointmentsBStrings: string[],
    schedule: Schedule
  ): Schedule | false {
    const bookings: string[] = [];

    for (let i = 0; i < daysInWeek; i++) {
      const tempBookings: string | false = this.bTimeFactory.modifyScheduleAndBooking(
        schedule.bookings[i],
        schedule.schedule[i],
        appointmentsBStrings[i]
      );

      if (!tempBookings) {
        return false;
      }

      bookings.push(tempBookings);
    }

    schedule.bookings = bookings;

    return schedule;
  }

  /**
   *  @description Takes an appointment and tests if the appointment to delete
   *  is valid, if not it returns false, if it is the schedule is updated
   *  to reflect the deletion
   *
   *  @param {Appointment} appointment appointment to test
   *  @param {Schedule} schedule schedule to test against
   *  @param {Appointment?} firstAppt — optional additional appointment to
   *  process if Appointment crosses date boundary
   *
   *  @returns {Schedule | false} Schedule | false
   */
  public deleteAppointment(appointment: Appointment, schedule: Schedule, firstAppt?: Appointment): Schedule | false {
    let startDay = appointment.startTime.getUTCDay();
    const endDay = appointment.endTime.getUTCDay();

    if (firstAppt) {
      startDay = firstAppt.startTime.getUTCDay();
      const firstApptCaluculated: string | false = this.bTimeFactory.deleteAppointment(
        firstAppt,
        schedule.bookings[startDay]
      );
      if (!firstApptCaluculated) {
        return false;
      }
      schedule.bookings[startDay] = firstApptCaluculated;
    }

    const mainCalculated: string | false = this.bTimeFactory.deleteAppointment(
      appointment,
      schedule.bookings[endDay]
    );

    if (!mainCalculated) {
      return false;
    }

    schedule.bookings[endDay] = mainCalculated;

    return schedule;
  }

  /**
   *  @description Takes an array of appointments and tests if the appointments
   *  to delete are valid, if not it returns false, if they are the schedule is
   *  updated to reflect the deletion
   *
   *  @param {string[]} appointmentsBStrings appointments to delete
   *  @param {Schedule} schedule schedule to delete appointments from
   *
   *  @returns {Schedule | false} Schedule | false
   */
  public deleteAppointments(appointmentsBStrings: string[], schedule: Schedule): Schedule | false {
    const bookings: string[] = [];

    for (let i = 0; i < daysInWeek; i++) {
      const calculatedSchedule: string | false = this.bTimeFactory.deleteAppointmentBString(
        appointmentsBStrings[i],
        schedule.bookings[i]
      );

      if (!calculatedSchedule) {
        return false;
      }

      bookings.push(calculatedSchedule);
    }

    schedule.bookings = bookings;

    return schedule;
  }
}