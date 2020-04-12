import {
  minutesInHour,
  hoursInDay,
  validTimeIntervals,
} from "../@types";

/**
 * @typedef Instantiates a new BPointerCalculator, which is responsible for
 * calculating bPointers, for use by other bTime classes
 *
 * @param {number} timeInterval the smallest discrete time interval
 *
 *  NB: Typically a temporal resolution of 5 mins is sufficient,
 *  as it constitutes the smallest billable unit in most juristictions
 *
 * @returns {BPointerCalculator} BPointerCalculator
 */
export class BPointerCalculator {
  /*
   * NB: This length was chosen such that each match is the equivalent
   *     of 1 hour
   * NB: This could be expanded to <= 32 due to IEEE 754 & 32bit ints in js
   */
  private timeInterval?: number;
  private intervalsInHour?: number;

  /**
   * @description Instantiates a new BPointerCalculator, which is responsible for
   * calculating bPointers, for use by other bTime classes
   *
   * @param {number} timeInterval the smallest discrete time interval
   *
   *  NB: Typically a temporal resolution of 5 mins is sufficient,
   *  as it constitutes the smallest billable unit in most juristictions
   *
   * @returns {BPointerCalculator} BPointerCalculator
   */
  public constructor(timeInterval: number) {
    if (!validTimeIntervals.has(timeInterval)) {
      throw new Error(`Invalid timeInterval entered for BPointerCalculator: ${timeInterval}`);
    }
    this.timeInterval = timeInterval;
    this.intervalsInHour = minutesInHour / timeInterval;
  }

  /**
   * @description Finds a the pointer for a given date in time
   * based on the instatiated time interval, including day of the week
   *
   * @param {Date} Date the time to retrieve the pointer
   *
   * @returns {number} number
   */
  public findBPointerIncludingDay(time: Date): number {
    const hourAndMinutePointer: number = this.findBPointer(time);
    const dayModifer: number = this.findBPointerModiferForDayOfWeek(time);

    return dayModifer + hourAndMinutePointer;
  }

  /**
   * @description Finds the pointer modifer to correct for day of the week
   *
   * @param {Date} time the time to retrieve the pointer
   *
   * @returns {number} number
   */
  public findBPointerModiferForDayOfWeek(time: Date): number {
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
  public findBPointer(time: Date): number{
    const hourPointer: number = time.getUTCHours() * this.intervalsInHour;
    const minutePointer: number = Math.floor(time.getUTCMinutes() / this.timeInterval);

    return hourPointer + minutePointer;
  }
}