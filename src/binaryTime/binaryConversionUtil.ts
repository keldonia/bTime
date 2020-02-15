import { BinaryStringUtil } from "./binaryStringUtil";
import { ScheduleBinaryUtil } from "./scheduleBinaryUtil";
// import { Schedule } from "../@types";

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

  /**
   *  @description BinaryConversionUtil is responsible for handling the conversion of schedules
   *  to Appointments
   *
   *  @param {binaryStringUtil} BinaryStringUtil binaryStringUtil for manipulating binary strings
   *  @param {ScheduleBinaryUtil} ScheduleBinaryUtil scheduleBinaryUtil for manipulating schedules
   *
   *  @returns {BinaryConversionUtil} binaryConversionUtil
   */
  constructor(binaryStringUtil: BinaryStringUtil, scheduleBinaryUtil: ScheduleBinaryUtil) {
    // this.binaryStringUtil = binaryStringUtil;
    // this.scheduleBinaryUtil = scheduleBinaryUtil;
  }

  /**
   *  @description Takes a schedule and generates a base Date object for each day of the week
   *
   *  @param {Schedule} schedule schedule to generate base Date objects
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
}