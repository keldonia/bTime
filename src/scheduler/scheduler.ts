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
    try {
      const availability: string[] = this.getCurrentAvailability(schedule) as string[];

      return this.bTimeFactory.convertScheduleToAppointmentSchedule(
        schedule,
        availability
      );
    } catch (error) {
      // NB: This should only be triggered by a malformed schedule
      throw new Error(
        `BScheduler Error: Was unable to convert schedule to appointment schedule, as the bookings do not fit in the schedule`
      );
    }
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
   *  based on the total availability and current bookings, throws an error if an
   *  invalid scehdule is passed
   *
   *  @param {Schedule} schedule
   *
   *  @throws {Error} Time intervals overlap
   *  @returns {string[]} string[]
   */
  public getCurrentAvailability(schedule: Schedule): string[] {
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
        try {
          const remainingAvailabilityMask: number = this.bTimeFactory.testViabilityAndCompute(
            flippedBAvailabiltyInterval,
            bBookingInterval
          );
          const remainingAvailability: number = ~remainingAvailabilityMask;

          calculatedAvailability.push(this.bTimeFactory.decimalToBString(remainingAvailability));
        } catch (error) {
          throw new Error(`BSchedule Error: Time intervals overlap on hour: ${j} of day: ${i} of the week starting on ${schedule.weekStart.toUTCString()}`);
        }
      }

      totalRemainingAvailability.push(calculatedAvailability.join(''));
    }

    return totalRemainingAvailability;
  }

  /**
   *  @description Tests a proposed appointment schedule update and updates the
   *  schedule, if theupdate is valid or throws an error if the update is not valid
   *
   *  @param {AppointmentSchedule} proposedAppointmentSchedule proposed schedule
   *  @param {Schedule} schedule current schedule
   *
   *  @throws {Error} Time intervals overlap
   *  @returns {AppointmentSchedule} AppointmentSchedule
   */
  public updateScheduleWithAppointmentSchedule(
    proposedAppointmentSchedule: AppointmentSchedule,
    schedule: Schedule
  ): AppointmentSchedule {
    const scheduleAppointments: Appointment[] = [];
    proposedAppointmentSchedule.schedule.forEach(appointments  => {
      appointments.forEach(appointment => {
        scheduleAppointments.push(appointment);
      });
    });
    const proposedScheduleStrings: string[] =
      this.bTimeFactory.generateBStringFromAppointments(scheduleAppointments);

    const proposedSchedule: Schedule = {
      schedule: proposedScheduleStrings,
      bookings: schedule.bookings,
      weekStart: schedule.weekStart
    };
    const updatedSchedule: Schedule = this.updateSchedule(proposedSchedule, schedule);

    const availability: string[] = this.getCurrentAvailability(schedule);

    return this.bTimeFactory.convertScheduleToAppointmentSchedule(updatedSchedule, availability);
  }

  /**
   *  @description Tests a propsoed schedule update and updates the schedule,
   *  if the update is valid or throws an error if the update is not valid
   *
   *  @param {Schedule} proposedSchedule proposed schedule
   *  @param {Schedule} schedule current schedule
   *
   *  @throws {Error} Time intervals overlap
   *  @returns {Schedule} Schedule
   */
  public updateSchedule(proposedSchedule: Schedule, schedule: Schedule): Schedule {
    for (let i = 0; i < daysInWeek; i++) {
      // We test that no bookings fall outside of the scheduled availability
      const proposed: string = proposedSchedule.schedule[i];
      const splitBookings: string[] = this.bTimeFactory.timeStringSplit(schedule.bookings[i]);
      const splitProposed: string[] = this.bTimeFactory.timeStringSplit(proposed);

      for (let j = 0; j < hoursInDay; j++) {
        const bBookingInterval: number = this.bTimeFactory.parseBString(splitBookings[j]);
        const flippedProposedInterval: number = ~this.bTimeFactory.parseBString(splitProposed[j]);

        try {
          this.bTimeFactory.testViabilityAndCompute(
            flippedProposedInterval,
            bBookingInterval
          );
        } catch (error) {
          throw error;
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
   *  the appointment updates are valid, if not it throws an error, if they are
   *  the schedule is updated
   *
   *  @param {Appointment[]} appointments appointments to process
   *  @param {Schedule} schedule schedule for appointments to be applied
   *  @param {ScheduleActions} actionType determines how to process appointment
   *
   *  @throws {Error} invalid action type
   *  @returns {Schedule} Schedule
   */
  public processAppointments(
    appointments: Appointment[],
    schedule: Schedule,
    actionType: ScheduleActions
  ): Schedule {
    const appointmentsBStrings: string[] = this.bTimeFactory.generateBStringFromAppointments(appointments);

    if (actionType === ScheduleActions.DELETE_APPT) {
      return this.deleteAppointments(appointmentsBStrings, schedule);
    }

    if (actionType === ScheduleActions.BOOKING_UPDATE) {
      return this.handleBookingUpdateBString(appointmentsBStrings, schedule);
    }

    throw new Error(`BScheduler Error: Recieved invalid action type: ${ScheduleActions[actionType]}, raw type: ${actionType}`);
  }

  /**
   *  @description Takes an appointment and update type and tests if the
   *  appointment update is valid, if not it throws an error, if it is the
   *  schedule is updated
   *
   *  @param {Appointment} appointment appointment to process
   *  @param {Schedule} schedule schedule for appointments to be applied
   *  @param {ScheduleActions} actionType determines how to process appointment
   *
   *  @throws {Error} invalid action type
   *  @returns {Schedule} Schedule
   */
  public processAppointment(
    appointment: Appointment,
    schedule: Schedule,
    actionType: ScheduleActions
  ): Schedule {
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

    throw new Error(`BScheduler Error: Recieved invalid action type: ${ScheduleActions[actionType]}, raw type: ${actionType}`);
  }

  /**
   *  @description Takes an appointment and tests if the appointment update
   *  is valid, if not it throws an error, if it is the schedule is updated
   *
   *  @param {Appointment} appointment appointment to test
   *  @param {Schedule} schedule schedule to test against
   *  @param {Appointment?} firstAppt — optional additional appointment to
   *  process if Appointment crosses date boundary
   *
   *  @throws {Error} time intervals overlap
   *  @returns {Schedule} Schedule
   */
  public handleBookingUpdate(
    appointment: Appointment,
    schedule: Schedule,
    firstAppt?: Appointment
  ): Schedule {
    let startDay = appointment.startTime.getUTCDay();
    const endDay = appointment.endTime.getUTCDay();

    if (firstAppt) {
      startDay = firstAppt.startTime.getUTCDay();
      const firstApptBString: string = this.bTimeFactory.generateBString(firstAppt);

      try {
        const tempBookings: string = this.bTimeFactory.modifyScheduleAndBooking(
          schedule.bookings[startDay],
          schedule.schedule[startDay],
          firstApptBString
        );

        schedule.bookings[startDay] = tempBookings;
      } catch (error) {
        throw new Error(`BSchedule Error: Time intervals overlap on ${firstAppt.startTime.toUTCString()} for schedule starting on ${schedule.weekStart.toUTCString()}`);
      }
    }

    const apptBString: string = this.bTimeFactory.generateBString(appointment);

    try {
      const tempBookings: string = this.bTimeFactory.modifyScheduleAndBooking(
        schedule.bookings[endDay],
        schedule.schedule[endDay],
        apptBString
      );

      schedule.bookings[endDay] = tempBookings;
    } catch (error) {
      throw new Error(`BSchedule Error: Time intervals overlap on ${appointment.startTime.toUTCString()} for schedule starting on ${schedule.weekStart.toUTCString()}`);
    }

    return schedule;
  }

  /**
   *  @description Takes an array of appointments and tests if the appointment
   *  update are valid, if not it throws an error, if they are the schedule is updated
   *
   *  @param {string[]} appointments appointments to test
   *  @param {Schedule} schedule schedule to test against
   *
   *  @throws {Error} time intervals overlap
   *  @returns {Schedule} Schedule
   */
  public handleBookingUpdateBString(
    appointmentsBStrings: string[],
    schedule: Schedule
  ): Schedule {
    const bookings: string[] = [];

    for (let i = 0; i < daysInWeek; i++) {
      try {
        const tempBookings: string = this.bTimeFactory.modifyScheduleAndBooking(
          schedule.bookings[i],
          schedule.schedule[i],
          appointmentsBStrings[i]
        );

        bookings.push(tempBookings);
      } catch {
        throw new Error(`BSchedule Error: time intervals overlap on day ${i} of the week starting on ${schedule.weekStart.toUTCString()}`);
      }
    }

    schedule.bookings = bookings;

    return schedule;
  }

  /**
   *  @description Takes an appointment and tests if the appointment to delete
   *  is valid, if not throws an error, if it is the schedule is updated
   *  to reflect the deletion
   *
   *  @param {Appointment} appointment appointment to test
   *  @param {Schedule} schedule schedule to test against
   *  @param {Appointment?} firstAppt — optional additional appointment to
   *  process if Appointment crosses date boundary
   *
   *  @throws {Error} Unable to delete appointment occuring outside of schedule
   *  @returns {Schedule} Schedule
   */
  public deleteAppointment(appointment: Appointment, schedule: Schedule, firstAppt?: Appointment): Schedule {
    let startDay = appointment.startTime.getUTCDay();
    const endDay = appointment.endTime.getUTCDay();

    if (firstAppt) {
      startDay = firstAppt.startTime.getUTCDay();
      try {
        const firstApptCaluculated: string = this.bTimeFactory.deleteAppointment(
          firstAppt,
          schedule.bookings[startDay]
        );

        schedule.bookings[startDay] = firstApptCaluculated;
      } catch (error) {
        throw new Error(`BScheduler Error: Unable to delete appointment starting at ${firstAppt.startTime.toUTCString()} and ending at ${firstAppt.endTime.toUTCString()}, occurs outside of schedule starting on ${schedule.weekStart.toUTCString()}`);
      }
    }

    try {
      const mainCalculated: string = this.bTimeFactory.deleteAppointment(
        appointment,
        schedule.bookings[endDay]
      );

      schedule.bookings[endDay] = mainCalculated;
    } catch (error) {
      throw new Error(`BScheduler Error: Unable to delete appointment starting at ${appointment.startTime.toUTCString()} and ending at ${appointment.endTime.toUTCString()}, occurs outside of schedule`);
    }

    return schedule;
  }

  /**
   *  @description Takes an array of appointments and tests if the appointments
   *  to delete are valid, if not throws an error, if they are the schedule is
   *  updated to reflect the deletion
   *
   *  @param {string[]} appointmentsBStrings appointments to delete
   *  @param {Schedule} schedule schedule to delete appointments from
   *
   *  @throws {Error} Invalid Deletion, interval to delete occurs outside of schedule interval
   *  @returns {Schedule} Schedule
   */
  public deleteAppointments(appointmentsBStrings: string[], schedule: Schedule): Schedule {
    const bookings: string[] = [];

    for (let i = 0; i < daysInWeek; i++) {
      try {
        const calculatedSchedule: string = this.bTimeFactory.deleteAppointmentBString(
          appointmentsBStrings[i],
          schedule.bookings[i]
        );

        bookings.push(calculatedSchedule);
      } catch (error) {
        throw new Error(`BSchedule Error: interval to delete occurs outside of schedule on day ${i} of the week starting on ${schedule.weekStart.toUTCString()}`);
      }
    }

    schedule.bookings = bookings;

    return schedule;
  }
}