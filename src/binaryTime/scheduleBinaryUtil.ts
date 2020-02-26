import { BinaryStringUtil } from "./binaryStringUtil";
import { Appointment, hoursInDay } from "../@types";

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
   *  @param {BinaryStringUtil} BinaryStringUtil binaryStringUtil for manipulating binary strings
   *
   *  @returns {ScheduleBinaryUtil} scheduleBinaryUtil
   */
  constructor(binaryStringUtil: BinaryStringUtil) {
    this.binaryStringUtil = binaryStringUtil;
  }

  /**
   *  @description Takes in a date and gets the UTC date and returns the UTC date that began the
   *   week that date is in.
   *
   *  @param {Date} Date date to find the beginning of the week
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
   *  @description Tests that an appointment does not overlap with another appointment, if it
   *  does not overlap, the appointment is added to the bookings, else return false
   *
   *  @param {Appointment} timeSlot timeSlot to modify schedule
   *  @param {string} schedule schedule to modify
   *
   *  @returns {string | false} string | false
   */
  public mergeScheduleBStringsWithTest(timeSlot: Appointment, schedule: string): string | false {
    const apptBString: string | false = this.binaryStringUtil.generateBinaryString(timeSlot);

    if (!apptBString) {
      return false;
    }

    return this.mergeScheduleBStringsWithTestBase(apptBString, schedule);
  }

  /**
   *  @description Tests that an appointment does not overlap with another appointment, if it
   *  does not overlap, the appointment is added to the bookings, else return false
   *
   *  @param {string} apptBString timeSlot bString to modify schedule
   *  @param {string} schedule schedule to modify
   *
   *  @returns {string | false} string | false
   */
  public mergeScheduleBStringsWithTestBase(apptBString: string, schedule: string): string | false {
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

    // IFF OR === XOR, there is not a schedule conflict
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
    return !!binaryDec;
  }

  /**
   *  @description Tests removal a give time slot from a given time interval
   *  and if valid removes it
   *  NB: This is also used for calculating remaining availability
   *
   *  @param {Appointment} timeSlotToDelete timeSlot to delete
   *  @param {string} scheduleSlot time interval to remove timeSlotToDelete
   *
   *  @returns {string} string of modified time interval
   */
  public deleteAppointment(timeSlotToDelete: Appointment, scheduleSlot: string): string | false {
    const apptToDeleteBString: string | false = this.binaryStringUtil.generateBinaryString(timeSlotToDelete);

    if (!apptToDeleteBString) {
      throw new Error(`Invalid appt passed to delete appointment: ${timeSlotToDelete.toString()}`);
    }

    return this.deleteAppointmentBString(apptToDeleteBString, scheduleSlot);
  }

  /**
   *  @description Tests removal a give time slot from a given time interval
   *  and if valid removes it
   *  NB: This is also used for calculating remaining availability
   *
   *  @param {string} bStringToDelete timeSlot to delete
   *  @param {string} scheduleSlot time interval to remove timeSlotToDelete
   *
   *  @returns {string} string of modified time interval
   */
  public deleteAppointmentBString(bStringToDelete: string, scheduleSlot: string): string | false {
    const apptMask: string[] = this.binaryStringUtil.timeStringSplit(
      bStringToDelete
    );
    const splitBookings: string[] = this.binaryStringUtil.timeStringSplit(scheduleSlot);
    const returnAppointment: string[] = [];

    for (let i = 0; i < hoursInDay; i++) {
      const currentInterval: string | false = this.deleteAppointmentInterval(
        apptMask[i],
        splitBookings[i]
      );

      if (!currentInterval) {
        return false;
      }

      returnAppointment.push(currentInterval);
    }

    return returnAppointment.join("");
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
  public deleteAppointmentInterval(timeSlotBString: string, scheduleInterval: string): string | false {
    const parsedSchedule: number = this.binaryStringUtil.parseBString(scheduleInterval);
    const parsedApptBString: number = this.binaryStringUtil.parseBString(timeSlotBString);

    if (!this.validDeletion(parsedSchedule, parsedApptBString)) {
      return false;
    }
    // Performs a XOR on the schedule and the proposed schedule
    const modified: number = parsedSchedule ^ parsedApptBString;

    return this.binaryStringUtil.decimalToBinaryString(modified);
  }

  /**
   *  @description Tests removal a give time slot from a given time interval
   *
   *  @param {number} baseNumber timeSlot to delete
   *  @param {number} toDeleteNumber time interval to remove timeSlotToDelete
   *
   *  @returns {boolean} valid deletion
   */
  public validDeletion(baseNumber: number, toDeleteNumber: number): boolean {
    const orTest: number = baseNumber | toDeleteNumber;

    return orTest === baseNumber;
  }
}