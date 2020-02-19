import { BinaryStringUtil } from "./binaryStringUtil";
import { ScheduleBinaryUtil } from "./scheduleBinaryUtil";
import { minutesInHour, Appointment } from "../@types";
// import { Schedule, AppointmentSchedule, Appointment, minutesInHour } from "../@types";

/**
 *  @typedef BinaryConversionUtil is responsible for handling the conversion of schedules
 *  to Appointments
 *
 *  @param {binaryStringUtil} BinaryStringUtil binaryStringUtil for manipulating binary strings
 *  @param {ScheduleBinaryUtil} ScheduleBinaryUtil scheduleBinaryUtil for manipulating schedules
 *
 *  @returns {BinaryConversionUtil} binaryConversionUtil
 */
export class BinaryConversionUtil {
  // private binaryStringUtil?: BinaryStringUtil;
  // private scheduleBinaryUtil?: ScheduleBinaryUtil;
  private timeInterval?: number;
  private intervalsInHour?: number;

  /**
   *  @description BinaryConversionUtil is responsible for handling the conversion of schedules
   *  to Appointments
   *
   *  @param {binaryStringUtil} BinaryStringUtil binaryStringUtil for manipulating binary strings
   *  @param {ScheduleBinaryUtil} ScheduleBinaryUtil scheduleBinaryUtil for manipulating schedules
   *
   *  @returns {BinaryConversionUtil} binaryConversionUtil
   */
  constructor(binaryStringUtil: BinaryStringUtil, scheduleBinaryUtil: ScheduleBinaryUtil, timeInterval: number) {
    // this.binaryStringUtil = binaryStringUtil;
    // this.scheduleBinaryUtil = scheduleBinaryUtil;
    this.timeInterval = timeInterval;
    this.intervalsInHour = minutesInHour / timeInterval;
  }

  /**
   *  @description Takes a date and generates a base Date object for each day of the week
   *
   *  @param {Date} Date date to generate base Date objects
   *
   *  @returns {Date[]} Date[]
   */
  public getDatesFromFromStartDate(date: Date): Date[] {
    const returnDates: Date[] = [date];

    /**
     * NB: We only need to create a date object for each day of the week.
     *     Additionally, Date::UTC automatically rolls over to the next
     *     largest increment if a value is greater than the max
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

  // /**
  //  *  @description Takes a schedule and converts into an array of appointments for each date
  //  *
  //  *  @param {Schedule} Schedule schedule to generate base Date objects
  //  *
  //  *  @returns {AppointmentSchedule} AppointmentSchedule
  //  */
  // public convertScheduleToAppointmentSchedule(schedule: Schedule): AppointmentSchedule {

  // }

  /**
   *  @description Takes a set of timeslots and the date on which they occurred
   *   and converts them into Appointments
   *
   *  @param {string} string timeslots to convert into appointments
   *  @param {Date} Date date of timeslots
   *
   *  @returns {Appointment[]} Appointments
   */
  public convertTimeSlotsStringToAppointments(timeSlots: string, date: Date): Appointment[] {
    const appointments: Appointment[] = [];
    let apptStart: boolean = true;
    let currentStart: Date | undefined;

    for (let i = 0; i < timeSlots.length; i++) {
      if (timeSlots.charAt(i) === "1" && !currentStart) {
        currentStart = this.calculateDate(i, date, apptStart);
        apptStart = !apptStart;
      }
      if (currentStart && timeSlots.charAt(i) === "0" ) {
        const currentEnd: Date = this.calculateDate(i, date, apptStart);
        const appointment: Appointment = {
          startTime: currentStart,
          endTime: currentEnd
        };
        appointments.push(appointment);
        apptStart = !apptStart;
        currentStart = undefined;
      }
      if (currentStart && i === timeSlots.length - 1) {
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
        apptStart = !apptStart;
        currentStart = undefined;
      }
    }

    return appointments;
  }

  /**
   *  @description Takes a set of timeslots and the date on which they occurred
   *   and converts them into Appointments
   *
   *  @param {number} number timePointerIndex
   *  @param {Date} Date base date
   *  @param {boolean} boolean beginning of appointment?
   *
   *  @returns {Date} calculated date
   */
  public calculateDate(timePointerIndex: number, baseDate: Date, beginning: boolean): Date {
    const hours = Math.floor(timePointerIndex / this.intervalsInHour);
    const minutes = timePointerIndex % this.intervalsInHour * this.timeInterval;

    return new Date(
      Date.UTC(
        baseDate.getUTCFullYear(),
        baseDate.getUTCMonth(),
        baseDate.getUTCDate(),
        hours,
        minutes
      )
    );
  }
}