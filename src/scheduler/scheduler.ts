import { Schedule, ScheduleActions, daysInWeek, Appointment, AppointmentDuo, hoursInDay, AppointmentSchedule, millisecondsInWeek, millisecondsInDay} from '../@types';
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
   *  @param {Appointment} appointment appointment to convert to UTC
   *
   *  @returns {Appointment} Appointment
   */
  public enforceUTC(appointment: Appointment): Appointment {
    const appointmentStart: Date = appointment.startTime;
    const startTime: Date = new Date(
      Date.UTC(
        appointmentStart.getUTCFullYear(),
        appointmentStart.getUTCMonth(),
        appointmentStart.getUTCDate(),
        appointmentStart.getUTCHours(),
        appointmentStart.getUTCMinutes()
      )
    );
    const appointmentEnd: Date = appointment.endTime;
    const endTime: Date = new Date(
      Date.UTC(
        appointmentEnd.getUTCFullYear(),
        appointmentEnd.getUTCMonth(),
        appointmentEnd.getUTCDate(),
        appointmentEnd.getUTCHours(),
        appointmentEnd.getUTCMinutes()
      )
    );

    return {
      startTime,
      endTime
    };
  }

  /**
   *  @description Takes a schedule and converts into an array of appointments for each date
   *
   *  NB: This is a passthrough to the configured BinaryTimeFactory
   *
   *  @param {Schedule} Schedule schedule to generate base Date objects
   *
   *  @returns {AppointmentSchedule} AppointmentSchedule
   */
  public convertScheduleToAppointmentSchedule(schedule: Schedule): AppointmentSchedule {
    const availability: string[] | false = this.getCurrentAvailability(schedule);

    // NB: This should only be triggered by a malformed schedule
    if (!availability) {
      throw new Error(`Was unable to convert schedule to appointment schedule, as the bookings do not fit in the schedule`);
    }

    return this.binaryTimeFactory.convertScheduleToAppointmentSchedule(schedule, availability);
  }

  /**
   *  @description Utility function to split appointments over day boundary
   *
   *  @param {Appointment} appointment appointment to split
   *
   *  @returns {AppointmentDuo} AppointmentDuo
   */
  public composeAppointments(appointment: Appointment): AppointmentDuo {
    const utcAppt: Appointment = this.enforceUTC(appointment);
    const utcStartTime: Date = utcAppt.startTime;
    const utcEndTime: Date = utcAppt.endTime;

    // Clone Appt
    const initialAppointment: Appointment = {
      startTime: utcStartTime,
      endTime: new Date(
        Date.UTC(
          utcStartTime.getUTCFullYear(),
          utcStartTime.getUTCMonth(),
          utcStartTime.getUTCDate(),
          23,
          59
        )
      )
    };

    const secondAppointment: Appointment = {
      startTime: new Date(
        Date.UTC(
          utcEndTime.getUTCFullYear(),
          utcEndTime.getUTCMonth(),
          utcEndTime.getUTCDate(),
          0,
          0
        )
      ),
      endTime: utcEndTime
    };

    return {
      initialAppointment,
      secondAppointment
    };
  }

  /**
   *  @description Takes a valid schedule and computes the remaining availability based
   *  on the total availability and current bookings, returns false if an invalid scehdule
   *  is passed
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
      const splitBookings: string[] = this.binaryTimeFactory.timeStringSplit(schedule.bookings[i]);
      const splitAvailability: string[] = this.binaryTimeFactory.timeStringSplit(availability);
      const calculatedAvailability: string[] = [];

      for (let j = 0; j < splitBookings.length; j++) {
        const flippedBAvailabiltyInterval: number = ~this.binaryTimeFactory.parseBString(splitAvailability[j]);
        const bBookingInterval: number = this.binaryTimeFactory.parseBString(splitBookings[j]);
        const remainingAvailabilityMask: number | false = this.binaryTimeFactory.testViabilityAndCompute(
          flippedBAvailabiltyInterval,
          bBookingInterval
        );

        if (!remainingAvailabilityMask) {
          return false;
        }

        const remainingAvailability: number = ~remainingAvailabilityMask;

        calculatedAvailability.push(this.binaryTimeFactory.decimalToBinaryString(remainingAvailability));
      }

      totalRemainingAvailability.push(calculatedAvailability.join(''));
    }

    return totalRemainingAvailability;
  }

  /**
   *  @description Tests a propsoed appointment schedule update and updates the schedule,
   *  if theupdate is valid or returns false if the update is not valid
   *
   *  @param {AppointmentSchedule} proposedAppointmentSchedule
   *  @param {Schedule} schedule
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
    const proposedScheduleStrings: string[] | false = this.binaryTimeFactory.generateBinaryStringFromAppointments(scheduleAppointments);

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

    return this.binaryTimeFactory.convertScheduleToAppointmentSchedule(updatedSchedule, availability);
  }

  /**
   *  @description Tests a propsoed schedule update and updates the schedule, if the
   *  update is valid or returns false if the update is not valid
   *
   *  @param {Schedule} proposedSchedule
   *  @param {Schedule} schedule
   *
   *  @returns {Schedule | false} Schedule | false
   */
  public updateSchedule(proposedSchedule: Schedule, schedule: Schedule): Schedule | false {
    for (let i = 0; i < daysInWeek; i++) {
      // We test that no bookings fall outside of the scheduled availability
      const proposed: string = proposedSchedule.schedule[i];
      const splitBookings: string[] = this.binaryTimeFactory.timeStringSplit(schedule.bookings[i]);
      const splitProposed: string[] = this.binaryTimeFactory.timeStringSplit(proposed);

      for (let j = 0; j < hoursInDay; j++) {
        const bBookingInterval: number = this.binaryTimeFactory.parseBString(splitBookings[j]);
        const flippedProposedInterval: number = ~this.binaryTimeFactory.parseBString(splitProposed[j]);

        const viabile: number | false = this.binaryTimeFactory.testViabilityAndCompute(
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
   *  @description Takes an array of appointments and update type and tests if the
   *  appointment updates are valid, if not it returns false, if they are the schedule
   *  is updated
   *
   *  @param {Appointment[]} appointments
   *  @param {Schedule} schedule
   *  @param {ScheduleActions} actionType
   *
   *  @returns {Schedule | false} Schedule | false
   */
  public processAppointments(
    appointments: Appointment[],
    schedule: Schedule,
    actionType: ScheduleActions
  ): Schedule | false {
    const appointmentsBStrings: string[] | false = this.binaryTimeFactory.generateBinaryStringFromAppointments(appointments);

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
   *  @description Takes an appointment and update type and tests if the appointment update
   *  is valid, if not it returns false, if it is the schedule is updated
   *
   *  @param {Appointment} appointment
   *  @param {Schedule} schedule
   *  @param {ScheduleActions} actionType
   *
   *  @returns {Schedule | false} Schedule | false
   */
  public processAppointment(
    appointment: Appointment,
    schedule: Schedule,
    actionType: ScheduleActions
  ): Schedule | false {
    const crosssesDayBoundary: boolean = this.crosssesDayBoundary(appointment);
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
   *  @param {Appointment} appointment
   *  @param {Schedule} schedule
   *  @param {Appointment?} firstAppt
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
   *  @description Takes an array of appointments and tests if the appointment
   *  update are valid, if not it returns false, if they are the schedule is updated
   *
   *  @param {string[]} appointments
   *  @param {Schedule} schedule
   *
   *  @returns {Schedule | false} Schedule | false
   */
  public handleBookingUpdateBString(
    appointmentsBStrings: string[],
    schedule: Schedule
  ): Schedule | false {
    const bookings: string[] = [];

    for (let i = 0; i < daysInWeek; i++) {
      const tempBookings: string | false = this.binaryTimeFactory.modifyScheduleAndBooking(
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
   *  @param {Appointment} appointment
   *  @param {Schedule} schedule
   *  @param {Appointment?} firstAppt
   *
   *  @returns {Schedule | false} Schedule | false
   */
  public deleteAppointment(appointment: Appointment, schedule: Schedule, firstAppt?: Appointment): Schedule | false {
    let startDay = appointment.startTime.getUTCDay();
    const endDay = appointment.endTime.getUTCDay();

    if (firstAppt) {
      startDay = firstAppt.startTime.getUTCDay();
      const firstApptCaluculated: string | false = this.binaryTimeFactory.deleteAppointment(
        firstAppt,
        schedule.bookings[startDay]
      );
      if (!firstApptCaluculated) {
        return false;
      }
      schedule.bookings[startDay] = firstApptCaluculated;
    }

    const mainCalculated: string | false = this.binaryTimeFactory.deleteAppointment(
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
   *  @param {string[]} appointmentsBStrings
   *  @param {Schedule} schedule
   *
   *  @returns {Schedule | false} Schedule | false
   */
  public deleteAppointments(appointmentsBStrings: string[], schedule: Schedule): Schedule | false {
    const bookings: string[] = [];

    for (let i = 0; i < daysInWeek; i++) {
      const calculatedSchedule: string | false = this.binaryTimeFactory.deleteAppointmentBString(
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

  /**
   *  @description Takes an appointment and checks if the appoint crosses a day boundry
   *
   *  NB: We assume that at most appts cross 1 day boundary
   *
   *  @param {Appointment} appt
   *
   *  @returns {boolean} boolean
   */
  public crosssesDayBoundary(appt: Appointment): boolean {
    return appt.startTime.getUTCDay() !== appt.endTime.getUTCDay();
  }

  /**
   *  @description Takes an appointment and checks if the appoint crosses a week boundry
   *
   *  @param {Appointment} appt
   *
   *  @returns {boolean} boolean
   */
  public crosssesWeekBoundary(appt: Appointment): boolean {
    return this.getWeek(appt.startTime) !== this.getWeek(appt.endTime);
  }

  /**
   *  @description Takes date and gets the week since the Unix Epoch
   *
   *  @param {Date} date
   *
   *  @returns {number} number
   */
  public getWeek(date: Date): number {
    /**
     * NB: This handles the fact the Unix Epoch began on
     * Thursday Jan 1, 1970
     */
    const adjustedDate: number = date.valueOf() + (4 * millisecondsInDay);

    return Math.floor(adjustedDate / millisecondsInWeek);
  }
}