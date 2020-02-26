import {
  minutesInHour, binaryBase, hoursInDay, validTimeIntervals, Appointment } from "../@types";

const zeroPad: string = "0";

/**
 * @typedef BinaryStringUtil is responsible for generating and formatting
 * the binary strings used by this package
 *
 *  @param {number} timeInterval the smallest discrete time interval
 *
 *  @returns {BinaryStringUtil} binaryStringUtil
 */
export class BinaryStringUtil {
  private timeInterval?: number;
  /*
   * Calculated Constants
   * NB: This length was chosen such that each match is the equivalent
   *     of 1 hour
   * NB: This could be expanded to <= 32 due to IEEE 754 & 32bit ints in js
   */
  private intervalsInHour?: number;
  private bStringSplitRegex?: RegExp;
  private emptyHour?: string;
  private emptyDay?: string;

  /**
   * @description Instantiates a new BinaryStringUtil, which is responsible for
   * generating and formatting  the binary strings used by this package
   *
   * @param {number} timeInterval the smallest discrete time interval
   *  NB: Typically a temporal resolution of 5 mins is sufficient,
   *  as it constitutes the smallest billable unit in most juristictions
   *
   * @returns {BinaryStringUtil} BinaryStringUtil
   */
  public constructor(timeInterval: number) {
    if (!validTimeIntervals.has(timeInterval)) {
      throw new Error(`Invalid timeInterval entered for BinaryStringUtil: ${timeInterval}`);
    }
    this.timeInterval = timeInterval;
    this.intervalsInHour = minutesInHour / timeInterval;

    // Generate calulated constants
    const bStringSplitRegexStr = "(.{1," + this.intervalsInHour + "})";
    this.bStringSplitRegex = new RegExp(bStringSplitRegexStr, 'g');
    this.emptyHour = zeroPad.repeat(this.intervalsInHour);
    this.emptyDay = this.emptyHour.repeat(hoursInDay);
  }

  /**
   * @description Generates a binary string representation of a given
   * appointment, assuming it is valid.  If the appointment is invalid,
   * it return false, ie it ends before it begins
   *
   * @param {Appointment} appt the appointment to converted
   *
   * @returns {string | false} string | false
   */
  public generateBinaryString(appt: Appointment): string | false {
    if (appt.endTime.valueOf() < appt.startTime.valueOf()) {
      return false;
    }

    const startPointer = this.findBinaryPointer(appt.startTime);
    const endPointer = this.findBinaryPointer(appt.endTime);
    const timeBlock = endPointer - startPointer + 1;

    return (this.emptyDay.substring(0, startPointer) +
      "1".repeat(timeBlock) +
      this.emptyDay.substring(endPointer + 1));
  }

  /**
   * @description Finds a the pointer for a given date in time
   * based on the instatiated time interval, including day of the week
   *
   * @param {Date} time the time to retrieve the pointer
   *
   * @returns {number} number
   */
  public findBinaryPointerIncludingDay(time: Date): number {
    const hourAndMinutePointer: number = this.findBinaryPointer(time);
    const dayModifer: number = this.findBinaryPointerModiferForDayOfWeek(time);

    return dayModifer + hourAndMinutePointer;
  }

  /**
   * @description Finds the modifer to correct for the day of the week
   *
   * @param {Date} time the time to retrieve the pointer
   *
   * @returns {number} number
   */
  public findBinaryPointerModiferForDayOfWeek(time: Date): number {
    return time.getUTCDay() * this.intervalsInHour * hoursInDay;
  }

  /**
   * @description Finds a the pointer for a given date in time
   * based on the instatiated time interval within a given day
   *
   * @param {Date} time the time to retrieve the pointer
   *
   * @returns {number} number
   */
  public findBinaryPointer(time: Date): number{
    const hourPointer: number = time.getUTCHours() * this.intervalsInHour;
    const minutePointer: number = Math.floor(time.getUTCMinutes() / this.timeInterval);

    return hourPointer + minutePointer;
  }

  /**
   * @description Splits each schedule BString into a string of length
   * defined in the regex
   *
   * @param {string} scheduleString binary schedule string to be split
   *
   * @returns {string[]} string[]
   */
  public timeStringSplit(scheduleString: string): string[] {
    return scheduleString.match(this.bStringSplitRegex);
  }

  /**
   * @description Converts binaryString representation of a number
   * into a number for calculation purposes
   *
   * @param {string} bString binary string to be converted into a number
   *
   * @returns {number} number
   */
  public parseBString(bString: string): number {
    return parseInt(bString, binaryBase);
  }

  /**
   * @description Converts number into a binaryString representation with
   * the given scheduling interval
   *
   * @param {number} decimal number to be converted into a binary string
   *
   * @returns {string} string
   */
  public decimalToBinaryString(decimal: number): string {
    return decimal
      .toString(binaryBase)
      .padStart(this.intervalsInHour, zeroPad);
  }
}