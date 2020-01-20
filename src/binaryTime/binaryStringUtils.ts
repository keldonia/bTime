import { minutesInHour, binaryBase, hoursInDay, MomentAppointment } from "../@types";
import { Moment } from 'moment';

const zeroPad: string = "0";

/**
 * @typedef BinaryStringUtil is responsible for generating and formatting 
 * the binary strings used by this package
 *
 *  @param {number} timeInterval the smallest discrete time interval
 *
 *  @returns {BinaryStringUtil} dependencyExecutor
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
   *
   * @returns {BinaryStringUtil}
   */
  public constructor(timeInterval: number) {
      this.timeInterval = timeInterval;
      this.intervalsInHour = minutesInHour / timeInterval;

      // Generate calulated constants
      const bStringSplitRegexStr = ".{1," + this.intervalsInHour + "}";
      this.bStringSplitRegex = new RegExp(bStringSplitRegexStr);
      this.emptyHour = zeroPad.repeat(this.intervalsInHour);
      this.emptyDay = this.emptyHour.repeat(hoursInDay);
  }

  /**
   * @description Generates a binary string representation of a given
   * appointment, assuming it is valid.  If the appointment is invalid,
   * it return false
   * 
   * @param {MomentAppointment} appt the appointment to converted
   *
   * @returns {string | boolean}
   */
  public generateBinaryString(appt: MomentAppointment): string | boolean {
    const startPointer = this.findBinaryPointer(appt.startTime);
    const endPointer = this.findBinaryPointer(appt.endTime);
    const timeBlock = endPointer - startPointer;

    if (timeBlock < 0) {
      return false;
    }

    return (this.emptyDay.substring(0, startPointer) +
      "1".repeat(timeBlock) +
      this.emptyDay.substring(endPointer));
  }

  /**
   * @description Finds a the pointer for a given moment in time
   * based on the instatiated time interval
   * 
   * @param {Moment} time the time to retrieve the pointer
   *
   * @returns {number}
   */
  public findBinaryPointer(time: Moment): number{
    const hourPointer: number = time.hour() * this.intervalsInHour;
    const minutePointer: number = Math.round(time.minute() / this.timeInterval);

    return hourPointer + minutePointer;
  }

  /**
   * @description Splits each schedule BString into a string of length
   * defined in the regex
   * 
   * @param {string} scheduleString binary schedule string to be split
   * 
   * @returns {string[]}
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
   * @returns {number}
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
   * @returns {string}
   */
  public decimalToBinaryString(decimal: number): string {
    return decimal
      .toString(binaryBase)
      .padStart(this.intervalsInHour, zeroPad);
  }
};