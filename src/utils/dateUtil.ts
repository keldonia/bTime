import {
  Appointment,
  millisecondsInWeek,
  millisecondsInDay
} from "../@types";

/**
 *  @typedef DateUtil is a singleton class response for performing
 *  common manipulations of Date objects for bTime
 */
export class DateUtil {
  private static instance: DateUtil;

  private constructor() {
  }

  /**
   *  @description Returns the instance of the DateUtil class,
   *   if not currently instantiated, it will return a new instance
   *
   *  @returns {DateUtil} DateUtil
   */
  public static getInstance(): DateUtil {
    if (!this.instance) {
      this.instance = new DateUtil();
    }

    return this.instance;
  }

  /**
   *  @description Utility function to ensure both Dates in
   *    and appointment are UTC, converting to UTC if not
   *
   *  @param {Appointment} appointment appointment to convert to UTC
   *
   *  @returns {Appointment} Appointment
   */
  public enforceUTC(appointment: Appointment): Appointment {
    return {
      startTime: this.getUTC(appointment.startTime),
      endTime: this.getUTC(appointment.endTime)
    };
  }

  /**
   *  @description Utility function to ensure a Date is UTC
   *
   *  @param {Date} date date to convert to UTC
   *
   *  @returns {Date} date
   */
  public getUTC(date: Date): Date {
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes()
      )
    );
  }

  /**
   *  @description Takes in a date and gets the UTC date and returns the UTC date
   *  that began the week that date is in.
   *
   *  @param {Date} date date to find the beginning of the week
   *
   *  @returns {Date} Date
   */
  public getFirstDayOfWeekFromDate(date: Date): Date {
    const modifiedDate = date.getUTCDate() - date.getUTCDay();
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        modifiedDate,
        0,
        0
      )
    );
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
   *  @description Takes an appointment and checks if the appoint crosses a day boundry
   *
   *  NB: We assume that at most appts cross 1 day boundary
   *
   *  @param {Appointment} appt appointment to test
   *
   *  @returns {boolean} boolean
   */
  public crosssesDayBoundary(appt: Appointment): boolean {
    return appt.startTime.getUTCDay() !== appt.endTime.getUTCDay();
  }

  /**
   *  @description Takes an appointment and checks if the appoint crosses a week boundry
   *
   *  @param {Appointment} appt appointment to test
   *
   *  @returns {boolean} boolean
   */
  public crosssesWeekBoundary(appt: Appointment): boolean {
    return this.getWeek(appt.startTime) !== this.getWeek(appt.endTime);
  }

  /**
   *  @description Takes date and returns the week since the Unix Epoch
   *
   *  @param {Date} date date to get week since Unix Epoch from
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

  /**
   *  @description Takes a date and returns the utc start of the day
   *
   *  @param {Date} date date to get the utc start of the day
   *
   *  @returns {Date} Date
   */
  public getUtcDateStart(date: Date): Date {
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        0,
        0
      )
    );
  }

  /**
   *  @description Takes a date and returns the utc end of the day
   *
   *  @param {Date} date date to get the utc end of the day
   *  @param {number} seconds optional seconds value, default zero (0)
   *
   *  @returns {Date} Date
   */
  public getUtcDateEnd(date: Date, seconds: number = 0): Date {
    return new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        23,
        59,
        seconds
      )
    );
  }
}