import { Schedule, AppointmentSchedule, Appointment, minutesInHour, hoursInDay, validTimeIntervals } from "../@types";

/**
 *  @typedef BinaryConversionUtil is responsible for handling the conversion of schedules
 *  to Appointments
 *
 *  @param {number} timeInterval the smallest discrete time interval
 *
 *  @returns {BinaryConversionUtil} BinaryConversionUtil
 */
export class BinaryConversionUtil {
  private timeInterval?: number;
  private intervalsInHour?: number;
  private intervalsInDay?: number;

  /**
   *  @description BinaryConversionUtil is responsible for handling the conversion of schedules
   *  to Appointments
   *
   *  @param {number} timeInterval the smallest discrete time interval
   *
   *  @returns {BinaryConversionUtil} BinaryConversionUtil
   */
  constructor(timeInterval: number) {
    if (!validTimeIntervals.has(timeInterval)) {
      throw new Error(`Invalid timeInterval entered for BinaryConversionUtil: ${timeInterval}`);
    }

    this.timeInterval = timeInterval;
    this.intervalsInHour = minutesInHour / timeInterval;
    this.intervalsInDay = this.intervalsInHour * hoursInDay;
  }

  /**
   *  @description Takes a date and generates a base Date for each day of the week
   *
   *  @param {Date} date date to generate base Date objects
   *
   *  @returns {Date[]} Date[]
   */
  public getDatesFromFromStartDate(date: Date): Date[] {
    const returnDates: Date[] = [date];

    /**
     * NB: We only need to create a Date for each day of the week.
     *     Additionally, Date::UTC automatically rolls over to the next
     *     largest increment, if a value is greater than the max
     *     day 0 = Sunday
     */
    for (let i = 1; i < 7; i++) {
      const modifiedDate: number = date.getUTCDate() + i;
      const newDate = new Date(
        Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          modifiedDate,
          0,
          0
        )
      );

      returnDates.push(newDate);
    }

    return returnDates;
  }

  /**
   *  @description Takes a schedule and the schedule's remaining availability 
   *    and converts each of the bTime representations into Appointment arrays
   *
   *  @param {Schedule} schedule schedule to generate base Date objects
   *  @param {string[]} availability remaining availability for a given schedule
   *
   *  @returns {AppointmentSchedule} AppointmentSchedule
   */
  public convertScheduleToAppointmentSchedule(schedule: Schedule, availability: string[]): AppointmentSchedule {
    const days: Date[] = this.getDatesFromFromStartDate(schedule.weekStart);
    const appointmentAvailability: Appointment[][] = availability.map((avail, idx) => {
      return this.convertTimeSlotsStringToAppointments(avail, days[idx]);
    });
    const appointmentBookings: Appointment[][] = schedule.bookings.map((bookingSet, idx) => {
      return this.convertTimeSlotsStringToAppointments(bookingSet, days[idx]);
    });
    const appointmentBaseSchedule: Appointment[][] = schedule.schedule.map((dayBaseSchedule, idx) => {
      return this.convertTimeSlotsStringToAppointments(dayBaseSchedule, days[idx]);
    });

    return {
      weekStart: schedule.weekStart,
      bookings: appointmentBookings,
      availability: appointmentAvailability,
      schedule: appointmentBaseSchedule
    };
  }

  /**
   *  @description Takes a set of timeslots and the date on which they occurred
   *   and converts them into Appointments
   *
   *  @param {string} timeslots string to convert into appointments
   *  @param {Date} date date of timeslots
   *
   *  @returns {Appointment[]} Appointment[] — converted appointments
   */
  public convertTimeSlotsStringToAppointments(timeSlots: string, date: Date): Appointment[] {
    const appointments: Appointment[] = [];
    let currentStart: Date | undefined;

    for (let i = 0; i < this.intervalsInDay; i++) {
      if (timeSlots.charAt(i) === "1" && !currentStart) {
        currentStart = this.calculateDate(i, date);
      }
      if (currentStart && timeSlots.charAt(i) === "0" ) {
        const currentEnd: Date = this.calculateDate(i - 1, date, true);
        const appointment: Appointment = {
          startTime: currentStart,
          endTime: currentEnd
        };
        appointments.push(appointment);
        currentStart = undefined;
      }
    }

    if (currentStart) {
      const currentEnd: Date = new Date(
        Date.UTC(
          date.getUTCFullYear(),
          date.getUTCMonth(),
          date.getUTCDate(),
          23,
          59,
          59
        )
      );
      const appointment: Appointment = {
        startTime: currentStart,
        endTime: currentEnd
      };
      appointments.push(appointment);
    }

    return appointments;
  }

  /**
   *  @description Takes a  time pointer, base date — the date on which it occured,
   *    and boolean if it is the end of an appointmen and converts it into a Date
   *
   *  @param {number} timePointerIndex pointer index for time
   *  @param {Date} baseDate base Date
   *  @param {boolean} end end of appointment?
   *
   *  @returns {Date} Date — calculated date
   */
  public calculateDate(timePointerIndex: number, baseDate: Date, end: boolean = false): Date {
    const hours = Math.floor(timePointerIndex / this.intervalsInHour);
    let minutes = timePointerIndex % this.intervalsInHour * this.timeInterval;

    if (end) {
      minutes += this.timeInterval;
    }

    return new Date(
      Date.UTC(
        baseDate.getUTCFullYear(),
        baseDate.getUTCMonth(),
        baseDate.getUTCDate(),
        hours,
        minutes,
        end ? -1 : 0
      )
    );
  }
}