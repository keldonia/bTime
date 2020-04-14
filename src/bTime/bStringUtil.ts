import {
  minutesInHour,
  binaryBase,
  hoursInDay,
  validTimeIntervals,
  Appointment,
  daysInWeek
} from "../@types";
import { BPointerCalculator } from "./bPointerCalculator";

const zeroPad: string = "0";

/**
 * @typedef BinaryStringUtil is responsible for generating and formatting
 * the binary strings used by this package
 *
 *  @param {number} timeInterval the smallest discrete time interval
 *
 *  NB: Typically a temporal resolution of 5 mins is sufficient,
 *  as it constitutes the smallest billable unit in most juristictions
 *
 *  @throws {Error} Invalid time interval
 *  @returns {BStringUtil} binaryStringUtil
 */
export class BStringUtil {
  /*
   * Calculated Constants
   */
  private intervalsInHour?: number;
  private intervalsInDay?: number;
  private intervalsInWeek?: number;
  private bStringSplitRegex?: RegExp;
  private bStringDaySplitRegex?: RegExp;
  private emptyHour?: string;
  private emptyDay?: string;
  private bPointerCalculator?: BPointerCalculator;

  /**
   * @description Instantiates a new BStringUtil, which is responsible for
   * generating and formatting  the bStrings used by this package
   *
   * @param {number} timeInterval the smallest discrete time interval
   *
   *  NB: Typically a temporal resolution of 5 mins is sufficient,
   *  as it constitutes the smallest billable unit in most juristictions
   *
   * @throws {Error} Invalid time interval
   * @returns {BStringUtil} BStringUtil
   */
  public constructor(timeInterval: number) {
    if (!validTimeIntervals.has(timeInterval)) {
      throw new Error(`BString Error: Invalid timeInterval entered for BStringUtil: ${timeInterval}`);
    }
    this.intervalsInHour = minutesInHour / timeInterval;
    this.intervalsInDay = minutesInHour / timeInterval * hoursInDay;
    this.intervalsInWeek = minutesInHour / timeInterval * hoursInDay * daysInWeek;
    this.bPointerCalculator = new BPointerCalculator(timeInterval);

    // Generate calulated constants
    const bStringSplitRegexStr = "(.{1," + this.intervalsInHour + "})";
    this.bStringSplitRegex = new RegExp(bStringSplitRegexStr, 'g');
    const bStringDaySplitRegex = "(.{1," + this.intervalsInDay + "})";
    this.bStringDaySplitRegex = new RegExp(bStringDaySplitRegex, 'g');
    this.emptyHour = zeroPad.repeat(this.intervalsInHour);
    this.emptyDay = this.emptyHour.repeat(hoursInDay);
  }

  /**
   * @description Generates a bString representation of a given
   * appointment, assuming it is valid.  If the appointment is invalid,
   * it will throw an error
   *
   * @param {Appointment} appt the appointment to be converted
   *
   * @throws {Error} Appointments can't end before they begin
   * @returns {string} string
   */
  public generateBString(appt: Appointment): string {
    if (appt.endTime.valueOf() < appt.startTime.valueOf()) {
      throw new Error(`BString Error: Appointment can't end before it begins.  Appointment start: ${appt.startTime.toUTCString()} Appointment end: ${appt.endTime.toUTCString()}`);
    }

    const startPointer = this.bPointerCalculator.findBPointer(appt.startTime);
    const endPointer = this.bPointerCalculator.findBPointer(appt.endTime);
    const timeBlock = endPointer - startPointer + 1;

    return (this.emptyDay.substring(0, startPointer) +
      "1".repeat(timeBlock) +
      this.emptyDay.substring(endPointer + 1));
  }

  /**
   * @description Generates a bString representation of a given
   * array of appointments, assuming it is valid.  If the appointment
   * is invalid, it will throw an error
   *
   * NB: This method generates a representation of the entire week
   * NB: Assumes appointments in array don't overlap
   *
   * @param {Appointment[]} appointments the appointments to be converted
   *
   * @throw {Error} Appointments can't end before they begin
   * @throw {Error} Appointments can't overlap
   * @returns {string[]} string[]
   */
  public generateBStringFromAppointments(appointments: Appointment[]): string[] {
    let composedBString: string = "";

    for (let i = 0; i < appointments.length; i++) {
      const appt: Appointment = appointments[i];

      if (appt.endTime.valueOf() < appt.startTime.valueOf()) {
        throw new Error(`BString Error: Appointment can't end before it begins.  Appointment start: ${appt.startTime.toUTCString()} Appointment end: ${appt.endTime.toUTCString()}`);
      }

      const startPointer = this.bPointerCalculator.findBPointerIncludingDay(appt.startTime);
      const endPointer = this.bPointerCalculator.findBPointerIncludingDay(appt.endTime);
      const timeBlock = endPointer - startPointer + 1;

      // If an appt begins before the previous ends, it is invalid
      if (startPointer < composedBString.length) {
        throw new Error(`BString Error: Appointment can't begin before previous appointment ends.  Appointment start: ${appt.startTime.toUTCString()} Previous Appointment end: ${appointments[i - 1].endTime.toUTCString()}`);
      }

      // Adds padding between appointments
      const addedZeros: string = "0".repeat(startPointer - composedBString.length);

      composedBString = composedBString + addedZeros + "1".repeat(timeBlock);
    }

    // Pad out remainder of week
    composedBString = composedBString + "0".repeat(this.intervalsInWeek - composedBString.length);

    return composedBString.match(this.bStringDaySplitRegex);
  }

  /**
   * @description Splits each schedule BString into a string of length
   * defined in the regex
   *
   * @param {string} scheduleString schedule string to be split
   *
   * @returns {string[]} string[]
   */
  public timeStringSplit(scheduleString: string): string[] {
    return scheduleString.match(this.bStringSplitRegex);
  }

  /**
   * @description Converts bString representation of a number
   * into a number for calculation purposes
   *
   * @param {string} bString bString to be converted into a number
   *
   * @returns {number} number
   */
  public parseBString(bString: string): number {
    return parseInt(bString, binaryBase);
  }

  /**
   * @description Converts number into a bString representation with
   * the given scheduling interval
   *
   * @param {number} decimal number to be converted into a bString
   *
   * @returns {string} string
   */
  public decimalToBString(decimal: number): string {
    return decimal
      .toString(binaryBase)
      .padStart(this.intervalsInHour, zeroPad);
  }
}