import { BStringUtil } from "./bStringUtil";
import { BScheduleUtil } from "./bScheduleUtil";
import {
  validTimeIntervals,
  Appointment,
  Schedule,
  AppointmentSchedule
} from "../@types";
import { BConversionUtil } from "./bConversionUtil";

/**
 * @typedef BTimeFactory Manages and exposes various binary scheduling
 * and string utils
 *
 *  @param {number} timeInterval the smallest discrete time interval
 *  NB: The time interval must be a factor of 60,
 *      ie. 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, or 60
 *
 *  @returns {BTimeFactory} bTimeFactory
 */
export class BTimeFactory {
  private timeInterval?: number;
  private bStringUtil?: BStringUtil;
  private bScheduleUtil?: BScheduleUtil;
  private bConversionUtil?: BConversionUtil;

  /**
   * @description BTimeFactory Manages and exposes various binary scheduling
   * and string utils
   *
   *  @param {number} timeInterval the smallest discrete time interval
   *
   *  @returns {BTimeFactory} bTimeFactory
   */
  public constructor(timeInterval: number) {
    if (!validTimeIntervals.has(timeInterval)) {
      throw new Error(`Invalid timeInterval entered for BTimeFactory: ${timeInterval}`);
    }

    this.timeInterval = timeInterval;
    this.bStringUtil = new BStringUtil(this.timeInterval);
    this.bScheduleUtil = new BScheduleUtil(this.bStringUtil);
    this.bConversionUtil = new BConversionUtil(this.timeInterval);
  }

  /**
   * @description Converts bString representation of a number
   * into a number for calculation purposes
   *
   * NB: This is a passthrough to the configured bStringUtil
   *
   * @param {string} bString binary string to be converted into a number
   *
   * @returns {number} number
   */
  public parseBString(bString: string): number {
    return this.bStringUtil.parseBString(bString);
  }

  /**
   * @description Generates a bString representation of a given
   * appointment, assuming it is valid.  If the appointment is invalid,
   * it return false
   *
   * NB: This is a passthrough to the configured bStringUtil
   *
   * @param {Appointment} appt the appointment to be converted
   *
   * @returns {string} string
   */
  public generateBString(appt: Appointment): string {
    return this.bStringUtil.generateBString(appt);
  }

  /**
   * @description Generates a bString representation of a given
   * array of appointments, assuming it is valid.  If the appointment
   * is invalid, it return false, ie it ends before it begins
   *
   * NB: This method generates a representation of the entire week
   * NB: Assumes appointments in array don't overlap
   * NB: This is a passthrough to the configured bStringUtil
   *
   * @param {Appointment[]} appointments the appointments to be converted
   *
   * @returns {string[] | false} string[] | false
   */
  public generateBStringFromAppointments(appointments: Appointment[]): string[] | false {
    return this.bStringUtil.generateBStringFromAppointments(appointments);
  }

  /**
   * @description Splits each schedule bString into a string of length
   * defined in the regex
   *
   * NB: This is a passthrough to the configured bStringUtil
   *
   * @param {string} scheduleString binary schedule string to be split
   *
   * @returns {string[]} string[]
   */
  public timeStringSplit(scheduleString: string): string[] {
    return this.bStringUtil.timeStringSplit(scheduleString);
  }

  /**
   * @description Converts number into a bString representation with
   * the given scheduling interval
   *
   * NB: This is a passthrough to the configured bStringUtil
   *
   * @param {number} decimal number to be converted into a bString
   *
   * @returns {string} string
   */
  public decimalToBString(decimal: number): string {
    return this.bStringUtil.decimalToBString(decimal);
  }

  /**
   *  @description Tests that two time intervals do not overlap
   *
   *  NB: This is a passthrough to the configured bScheduleUtil
   *
   *  @param {number} binary1 first time interval
   *  @param {number} binary2 second time interval
   *
   *  @returns {number | false} number | false
   */
  public testViabilityAndCompute(binary1: number, binary2: number): number | false {
    return this.bScheduleUtil.testViabilityAndCompute(binary1, binary2);
  }

  /**
   *  @description Tests removal a give time slot from a given time interval
   *  and if valid removes it
   *
   *  NB: This is also used for calculating remaining availability
   *  NB: This is a passthrough to the configured bScheduleUtil
   *
   *  @param {Appointment} timeSlotToDelete timeSlot to delete
   *  @param {string} scheduleSlot time interval to remove timeSlotToDelete
   *
   *  @returns {string} string of modified time interval
   */
  public deleteAppointment(timeSlotToDelete: Appointment, scheduleSlot: string): string | false {
    return this.bScheduleUtil.deleteAppointment(timeSlotToDelete, scheduleSlot);
  }

  /**
   *  @description Tests removal a give time slot from a given time interval
   *  and if valid removes it
   *
   *  NB: This is also used for calculating remaining availability
   *  NB: This is a passthrough to the configured bScheduleUtil
   *
   *  @param {string} bStringToDelete timeSlot to delete
   *  @param {string} scheduleSlot time interval to remove timeSlotToDelete
   *
   *  @returns {string} string of modified time interval
   */
  public deleteAppointmentBString(timeSlotToDelete: string, scheduleSlot: string): string | false {
    return this.bScheduleUtil.deleteAppointmentBString(timeSlotToDelete, scheduleSlot);
  }

  /**
   *  @description Tests that an timeSlot does not overlap with another timeSlot,
   *  if it does not overlap, the timeSlot is added to the bookings, else return
   *  false.  Additionally, this method checks that the timeslot is within
   *  availabilities (test)
   *
   *  NB: If testing a booking update, test that booking fits in avail
   *      This means that bookingsUpdate the inputs are (bookings, bookings, appt)
   *  NB: This is a passthrough to the configured bScheduleUtil
   *
   *  @param {string} scheduleBStringToModify schedule to modify
   *  @param {string} scheduleBStringToTest schedule to test (availability)
   *  @param {string} timeSlotBString timeSlot to modify schedule
   *
   *  @returns {string | false} string | false
   */
  public modifyScheduleAndBooking(
    scheduleBStringToModify: string,
    scheduleBStringToTest: string,
    appt: string
  ): string | false {
    return this.bScheduleUtil.modifyScheduleAndBooking(
      scheduleBStringToModify,
      scheduleBStringToTest,
      appt
    );
  }

  /**
   *  @description Takes a schedule and availabilty converting them into an array
   *  of appointments for each date
   *
   *  NB: This is a passthrough to the configured BConversionUtil
   *
   *  @param {Schedule} schedule schedule to generate base Date objects
   *  @param {string[]} string[] remaining availability for a given schedule
   *
   *  @returns {AppointmentSchedule} AppointmentSchedule
   */
  public convertScheduleToAppointmentSchedule(schedule: Schedule, availability: string[]): AppointmentSchedule {
    return this.bConversionUtil.convertScheduleToAppointmentSchedule(schedule, availability);
  }
}