import { Schedule, ScheduleActions, daysInWeek, Appointment, AppointmentDuo, hoursInDay} from '../@types';
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
      const splitproposed: string[] = this.binaryTimeFactory.timeStringSplit(proposed);

      for (let j = 0; j < hoursInDay; j++) {
        const bBookingInterval: number = this.binaryTimeFactory.parseBString(splitBookings[j]);
        const flippedProposedInterval: number = ~this.binaryTimeFactory.parseBString(splitproposed[j]);

        const viabile: number | false = this.binaryTimeFactory.testViabilityAndCompute(
          flippedProposedInterval,
          bBookingInterval
        );

        if (!viabile) {
          return false;
        }
      }
    }

    schedule.schedule = proposedSchedule.schedule;

    return schedule;
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
   *  @description Takes an appointment and update type and tests if the appointment delete
   *  is valid, if not it returns false, if it is the schedule is updated to reflect the deletion
   *
   *  @param {Appointment} appointment
   *  @param {Schedule} schedule
   *  @param {Appointment?} firstAppt
   *
   *  @returns {Schedule} Schedule
   */
  public deleteAppointment(appointment: Appointment, schedule: Schedule, firstAppt?: Appointment): Schedule {
    let startDay = appointment.startTime.getUTCDay();
    const endDay = appointment.endTime.getUTCDay();

    if (firstAppt) {
      startDay = firstAppt.startTime.getUTCDay();
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
   *  @param {Appointment} appt
   *
   *  @returns {boolean} boolean
   */
  public crosssesDayBoundary(appt: Appointment): boolean {
    return appt.startTime.getUTCDay() !== appt.endTime.getUTCDay();
  }
}