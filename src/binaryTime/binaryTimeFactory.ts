import { BinaryStringUtil } from "./binaryStringUtil";
import { ScheduleBinaryUtil } from "./scheduleBinaryUtil";
import { MomentAppointment, validTimeIntervals } from "../@types";

/**
 * @typedef BinaryTimeFactory Manages and exposes various binary scheduling and string
 * utils
 *
 *  @param {number} timeInterval the smallest discrete time interval
 *  NB: The time interval must be a factor of 60,
 *      ie. 1, 2, 3, 4, 5, 6, 10, 12, 15, 20, 30, or 60
 *
 *  @returns {BinaryTimeFactory} binaryTimeFactory
 */
export class BinaryTimeFactory {
  private timeInterval?: number;
  private binaryStringUtil?: BinaryStringUtil;
  private scheduleBinaryUtil?: ScheduleBinaryUtil;

  /**
   * @description BinaryTimeFactory Manages and exposes various binary scheduling and string
   * utils
   *
   *  @param {number} timeInterval the smallest discrete time interval
   *
   *  @returns {BinaryTimeFactory} binaryTimeFactory
   */
  public constructor(timeInterval: number) {
    if (!validTimeIntervals.has(timeInterval)) {
      throw new Error(`Invalid timeInterval entered: ${timeInterval}`);
    }

    this.timeInterval = timeInterval;
    this.binaryStringUtil = new BinaryStringUtil(this.timeInterval);
    this.scheduleBinaryUtil = new ScheduleBinaryUtil(this.binaryStringUtil);
  }

  /**
   * @description Converts binaryString representation of a number
   * into a number for calculation purposes
   *
   * NB: This is a passthrough to the configured binaryStringUtil
   * 
   * @param {string} bString binary string to be converted into a number
   *
   * @returns {number} number
   */
  public parseBString(bString: string): number {
    return this.binaryStringUtil.parseBString(bString);
  }

  /**
   * @description Generates a binary string representation of a given
   * appointment, assuming it is valid.  If the appointment is invalid,
   * it return false
   * 
   * NB: This is a passthrough to the configured binaryStringUtil
   *
   * @param {MomentAppointment} appt the appointment to converted
   *
   * @returns {string | false} string | false
   */
  public generateBinaryString(appt: MomentAppointment): string | false {
    return this.binaryStringUtil.generateBinaryString(appt);
  }

  /**
   *  @description Tests that two time intervals do not overlap
   * 
   *  NB: This is a passthrough to the configured scheduleBinaryUtil
   *
   *  @param {number} binary1 first time interval
   *  @param {number} binary2 second time interval
   *
   *  @returns {number | false} number | false
   */
  public testViabilityAndCompute(binary1: number, binary2: number): number | false {
    return this.scheduleBinaryUtil.testViabilityAndCompute(binary1, binary2);
  }

  /**
   *  @description Tests removal a give time slot from a given time interval
   *  and if valid removes it
   *  
   *  NB: This is also used for calculating remaining availability
   *  NB: This is a passthrough to the configured scheduleBinaryUtil
   *
   *  @param {MomentAppointment} timeSlotToDelete timeSlot to delete
   *  @param {string} scheduleSlot time interval to remove timeSlotToDelete
   *
   *  @returns {string} string of modified time interval
   */
  public deleteAppointment(timeSlotToDelete: MomentAppointment, scheduleSlot: string): string {
    return this.scheduleBinaryUtil.deleteAppointment(timeSlotToDelete, scheduleSlot);
  }

  /**
   *  @description Tests that an timeSlot does not overlap with another timeSlot, if it
   *  does not overlap, the timeSlot is added to the bookings, else return false.  Additionally,
   *  this method checks that the timeslot is within availabilities (test)
   *
   *  NB: If testing a booking update, test that booking fits in avail
   *      This means that bookingsUpdate the inputs are (bookings, bookings, appt)
   *  NB: This is a passthrough to the configured scheduleBinaryUtil
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
  ) {
    return this.scheduleBinaryUtil.modifyScheduleAndBooking(
      scheduleBStringToModify,
      scheduleBStringToTest,
      appt
    );
  }
}