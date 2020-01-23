import { BinaryStringUtil } from "./binaryStringUtil";
import { MomentAppointment } from "../@types";

/**
 *  @typedef ScheduleBinaryUtil is responsible for handling scheduling use bit manipulations
 *
 *  @param {binaryStringUtil} BinaryStringUtil binaryStringUtil for manipulating binary strings
 *
 *  @returns {ScheduleBinaryUtil} scheduleBinaryUtil
 */
export class ScheduleBinaryUtil {
  private binaryStringUtil?: BinaryStringUtil;

  /**
   *  @description ScheduleBinaryUtil is responsible for handling scheduling use bit manipulations
   *
   *  @param {binaryStringUtil} BinaryStringUtil binaryStringUtil for manipulating binary strings
   *
   *  @returns {ScheduleBinaryUtil} scheduleBinaryUtil
   */
  constructor(binaryStringUtil: BinaryStringUtil) {
    this.binaryStringUtil = binaryStringUtil;
  }

  /**
   *  @description Tests that an appointment does not overlap with another appointment, if it
   *  does not overlap, the appointment is added to the bookings, else return false
   *
   *  @param {MomentAppointment} timeSlot timeSlot to modify schedule
   *  @param {string} schedule schedule to modify
   *
   *  @returns {string | false} string | false
   */
  public mergeScheduleBStringsWithTest(timeSlot: MomentAppointment, schedule: string): string | false {
    const apptBString: string | false = this.binaryStringUtil.generateBinaryString(timeSlot);

    if (!apptBString) {
      return false;
    }

    const apptMask: string[] = this.binaryStringUtil.timeStringSplit(
      apptBString
    );
    const splitSchedule: string[] = this.binaryStringUtil.timeStringSplit(schedule);
    const mergedSchedule: string[] = [];

    /*
    *  NB: Iterate over each section of the schedule & appt to
    *  generate a combined schedule, it returns early if the merged
    *  schedule and appt BStrings conflict
    */
    for (let i: number = 0; i < splitSchedule.length; i++) {
      const mergeReturn: string | false = this.mergeScheduleBStringWithTest(
        splitSchedule[i],
        apptMask[i]
      );

      if (!mergeReturn) {
        return false;
      }
      mergedSchedule.push(mergeReturn);
    }

    return mergedSchedule.join("");
  }

  /**
   *  @description Tests that an timeSlot does not overlap with another timeSlot, if it
   *  does not overlap, the timeSlot is added to the bookings, else return false
   *
   *  @param {string} timeSlotBString timeSlot to modify schedule
   *  @param {string} schedule schedule to modify
   *
   *  @returns {string | false} string | false
   */
  public mergeScheduleBStringWithTest(timeSlotBString: string, schedule: string): string | false {
    const parsedSchedule: number = this.binaryStringUtil.parseBString(schedule);
    const parsedApptBString: number = this.binaryStringUtil.parseBString(timeSlotBString);
    // Performs a XOR on the schedule and the proposed schedule
    const modified: number = parsedSchedule ^ parsedApptBString;
    // Performs an OR on the schedule and the proposed schedule
    const test: number = parsedSchedule | parsedApptBString;

    // IFF OR === XOR then there is not a schedule conflict
    if (modified === test) {
      return this.binaryStringUtil.decimalToBinaryString(modified);
    }

    return false;
  }

  /**
   *  @description Tests that an timeSlot does not overlap with another timeSlot, if it
   *  does not overlap, the timeSlot is added to the bookings, else return false.  Additionally,
   *  this method checks that the timeslot is within availabilities (test)
   *
   *  NB: If testing a booking update, test that booking fits in avail
   *      This means that bookingsUpdate the inputs are (bookings, bookings, appt)
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
    const splitToModify: string[] = this.binaryStringUtil.timeStringSplit(scheduleBStringToModify);
    const splitToTest: string[] = this.binaryStringUtil.timeStringSplit(scheduleBStringToTest);
    const splitAppt: string[] = this.binaryStringUtil.timeStringSplit(appt);
    const modifedSchedule: string[] = [];

    /*
    *  NB: Iterate over each section of the schedule & appt to
    *  generate a combined schedule, it returns early if the merged
    *  schedule and appt BStrings conflict
    */
    for (let i = 0; i < splitToModify.length; i++) {
      const mergeReturn: string | false = this.modifyScheduleAndBookingInterval(
        splitToModify[i],
        splitToTest[i],
        splitAppt[i]
      );

      if (!mergeReturn) {
        return false;
      }
      modifedSchedule.push(mergeReturn);
    }

    return modifedSchedule.join("");
  }

  /**
   *  @description Tests that an timeSlot does not overlap with another timeSlot, if it
   *  does not overlap, the timeSlot is added to the bookings, else return false.  Additionally,
   *  this method checks that the timeslot is within availabilities (test)  This occurs within
   *  a schedule interval
   *
   *  NB: If testing a booking update, test that booking fits in avail
   *      This means that bookingsUpdate the inputs are (bookings, bookings, appt)
   *
   *  @param {string} scheduleBStringToModify schedule to modify
   *  @param {string} scheduleBStringToTest schedule to test (availability)
   *  @param {string} timeSlotBString timeSlot to modify schedule
   *
   *  @returns {string | false} string | false
   */
  public modifyScheduleAndBookingInterval(
    scheduleBStringToModify: string,
    scheduleBStringToTest: string,
    appt: string
  ): string | false {
    const parsedToModify: number = this.binaryStringUtil.parseBString(scheduleBStringToModify);
    // Flip the bits to test the pattern
    const parsedToTest: number = ~this.binaryStringUtil.parseBString(scheduleBStringToTest);
    const parsedApptBString: number = this.binaryStringUtil.parseBString(appt);

    const viabilityTest: number | false = this.testViabilityAndCompute(parsedApptBString, parsedToTest);

    // Test if change invalidates schedule or booking
    if (!this.booleanViabilityCheck(viabilityTest)) {
      return false;
    }

    const update: number | false = this.testViabilityAndCompute(parsedApptBString, parsedToModify);

    // Test if change invalid to update value
    if (!update && update !== 0) {
      return false;
    }

    return this.binaryStringUtil.decimalToBinaryString(update);
  }

  /**
   *  @description Tests that two time intervals do not overlap
   *
   *  @param {number} binary1 first time interval
   *  @param {number} binary2 second time interval
   *
   *  @returns {number | false} number | false
   */
  public testViabilityAndCompute(binary1: number, binary2: number): number | false {
    const modified: number = binary1 ^ binary2;
    const test: number = binary1 | binary2;

    if (modified === test) {
      return modified;
    }

    return false;
  }

  /**
   *  @description Quick test that it is a viable for tranformation
   *
   *  @param {number | boolean } binaryDec number to test
   *
   *  @returns {boolean} boolean
   */
  public booleanViabilityCheck(binaryDec: number | boolean): boolean {
    return binaryDec && binaryDec !== 0;
  }

  /**
   *  @description Tests removal a give time slot from a given time interval
   *  and if valid removes it
   *  NB: This is also used for calculating remaining availability
   *
   *  @param {MomentAppointment} timeSlotToDelete timeSlot to delete
   *  @param {string} scheduleSlot time interval to remove timeSlotToDelete
   *
   *  @returns {string} string of modified time interval
   */
  public deleteAppointment(timeSlotToDelete: MomentAppointment, scheduleSlot: string): string {
    const apptToDeleteBString: string | false = this.binaryStringUtil.generateBinaryString(timeSlotToDelete);

    if (!apptToDeleteBString) {
      throw new Error(`Invalid appt passed to delete appointment: ${timeSlotToDelete.toString()}`);
    }

    const apptMask: string[] = this.binaryStringUtil.timeStringSplit(
      apptToDeleteBString
    );
    const splitBookings: string[] = this.binaryStringUtil.timeStringSplit(scheduleSlot);

    return splitBookings.map((bookingInterval, idx) => {
      return this.deleteAppointmentInterval(
        apptMask[idx],
        bookingInterval
      );
    }).join("");
  }

  /**
   *  @description Tests removal a give time slot from a given time interval
   *  and if valid removes it
   *  NB: Deleted appts can restore availability not add new availability
   *      as appts can only be created where the is availability and
   *      availability cannot be deleted when there is a concurrent appt
   *
   *  @param {string} timeSlotBString timeSlot to delete
   *  @param {string} scheduleSlot time interval to remove timeSlotToDelete
   *
   *  @returns {string} string of modified time interval
   */
  public deleteAppointmentInterval(timeSlotBString: string, scheduleInterval: string): string {
    const parsedSchedule: number = this.binaryStringUtil.parseBString(scheduleInterval);
    const parsedApptBString: number = this.binaryStringUtil.parseBString(timeSlotBString);
    // Performs a XOR on the schedule and the proposed schedule
    const modified: number = parsedSchedule ^ parsedApptBString;

    return this.binaryStringUtil.decimalToBinaryString(modified);
  }
}