import { BStringUtil } from "./bStringUtil";
import { Appointment, hoursInDay } from "../@types";

/**
 *  @typedef BScheduleUtil is responsible for handling scheduling
 *  using bit manipulations
 *
 *  @param {bStringUtil} bStringUtil bStringUtil for manipulating
 *  binary strings
 *
 *  @returns {BScheduleUtil} BScheduleUtil
 */
export class BScheduleUtil {
  private bStringUtil?: BStringUtil;

  /**
   *  @description BScheduleUtil is responsible for handling scheduling
   *  using bit manipulations
   *
   *  @param {BStringUtil} bStringUtil bStringUtil for manipulating
   *  binary strings
   *
   *  @returns {BScheduleUtil} BScheduleUtil
   */
  constructor(bStringUtil: BStringUtil) {
    this.bStringUtil = bStringUtil;
  }

  /**
   *  @description Tests that an appointment does not overlap with another
   *  appointment, if it does not overlap, the appointment is added to the
   *  bookings, else throws an error
   *
   *  @param {Appointment} timeSlot timeSlot to modify schedule
   *  @param {string} schedule schedule to modify
   *
   *  @throws {Error} Invalid Appointment
   *  @throws {Error} schedules conflict and overlap
   *  @returns {string} string
   */
  public mergeScheduleBStringsWithTest(timeSlot: Appointment, schedule: string): string {
    if (timeSlot.endTime < timeSlot.startTime) {
      throw new Error(`BSchedule Error: Invalid timeslot passed to merge schedule BString: ${timeSlot.toString()}`);
    }
    const apptBString: string = this.bStringUtil.generateBString(timeSlot);

    try {
      return this.mergeScheduleBStringsWithTestBase(apptBString, schedule);
    } catch (error) {
      throw error;
    }
  }

  /**
   *  @description Tests that an appointment does not overlap with another
   *  appointment, if it does not overlap, the appointment is added to the
   *  bookings, else throws an error
   *
   *  @param {string} apptBString timeSlot bString to modify schedule
   *  @param {string} schedule schedule to modify
   *
   *  @throws {Error} schedules conflict and overlap
   *  @returns {string} string
   */
  public mergeScheduleBStringsWithTestBase(apptBString: string, schedule: string): string {
    const apptMask: string[] = this.bStringUtil.timeStringSplit(
      apptBString
    );
    const splitSchedule: string[] = this.bStringUtil.timeStringSplit(schedule);
    const mergedSchedule: string[] = [];

    /*
    *  NB: Iterate over each section of the schedule & appt to
    *  generate a combined schedule, it returns early if the merged
    *  schedule and appt BStrings conflict
    */
    for (let i: number = 0; i < splitSchedule.length; i++) {
      try {
        const mergeReturn: string = this.mergeScheduleBStringWithTest(
          splitSchedule[i],
          apptMask[i]
        );

        mergedSchedule.push(mergeReturn);
      } catch (error) {
        throw error;
      }
    }

    return mergedSchedule.join("");
  }

  /**
   *  @description Tests that an timeSlot does not overlap with another timeSlot,
   *  if it does not overlap, the timeSlot is added to the bookings, else throws an
   *  error
   *
   *  @param {string} timeSlotBString timeSlot to modify schedule
   *  @param {string} schedule schedule to modify
   *
   *  @throws {Error} schedules conflict and overlap
   *  @returns {string} string
   */
  public mergeScheduleBStringWithTest(timeSlotBString: string, schedule: string): string {
    const parsedSchedule: number = this.bStringUtil.parseBString(schedule);
    const parsedApptBString: number = this.bStringUtil.parseBString(timeSlotBString);
    // Performs a XOR on the schedule and the proposed schedule
    const modified: number = parsedSchedule ^ parsedApptBString;
    // Performs an OR on the schedule and the proposed schedule
    const test: number = parsedSchedule | parsedApptBString;

    // IFF OR === XOR, there is not a schedule conflict
    if (modified === test) {
      return this.bStringUtil.decimalToBString(modified);
    }

    throw new Error('BScheduleUtil Error: Schedules conflict and overlap');
  }

  /**
   *  @description Tests that an timeSlot does not overlap with another timeSlot,
   *  if it does not overlap, the timeSlot is added to the bookings, else throw
   *  an error.  Additionally, this method checks that the timeslot is within
   *  availabilities (test)
   *
   *  NB: If testing a booking update, test that booking fits in avail
   *      This means that bookingsUpdate the inputs are (bookings, bookings, appt)
   *
   *  @param {string} scheduleBStringToModify schedule to modify
   *  @param {string} scheduleBStringToTest schedule to test (availability)
   *  @param {string} timeSlotBString timeSlot to modify schedule
   *
   *  @throws {Error} Time intervals overlap
   *  @returns {string} string
   */
  public modifyScheduleAndBooking(
    scheduleBStringToModify: string,
    scheduleBStringToTest: string,
    appt: string
  ) {
    const splitToModify: string[] = this.bStringUtil.timeStringSplit(scheduleBStringToModify);
    const splitToTest: string[] = this.bStringUtil.timeStringSplit(scheduleBStringToTest);
    const splitAppt: string[] = this.bStringUtil.timeStringSplit(appt);
    const modifedSchedule: string[] = [];

    /*
    *  NB: Iterate over each section of the schedule & appt to
    *  generate a combined schedule, it returns early if the merged
    *  schedule and appt BStrings conflict
    */
    for (let i = 0; i < splitToModify.length; i++) {
      try {
        const mergeReturn: string = this.modifyScheduleAndBookingInterval(
          splitToModify[i],
          splitToTest[i],
          splitAppt[i]
        );

        modifedSchedule.push(mergeReturn);
      } catch (error) {
        throw error;
      }
    }

    return modifedSchedule.join("");
  }

  /**
   *  @description Tests that an timeSlot does not overlap with another timeSlot,
   *  if it does not overlap, the timeSlot is added to the bookings, else throws
   *  an error.  Additionally, this method checks that the timeslot is within
   *  availabilities (test)  This occurs within a schedule interval
   *
   *  NB: If testing a booking update, test that booking fits in avail
   *      This means that bookingsUpdate the inputs are (bookings, bookings, appt)
   *
   *  @param {string} scheduleBStringToModify schedule to modify
   *  @param {string} scheduleBStringToTest schedule to test (availability)
   *  @param {string} timeSlotBString timeSlot to modify schedule
   *
   *  @throws {Error} Time intervals overlap
   *  @returns {string} string
   */
  public modifyScheduleAndBookingInterval(
    scheduleBStringToModify: string,
    scheduleBStringToTest: string,
    appt: string
  ): string {
    const parsedToModify: number = this.bStringUtil.parseBString(scheduleBStringToModify);
    // Flip the bits to test the pattern
    const parsedToTest: number = ~this.bStringUtil.parseBString(scheduleBStringToTest);
    const parsedApptBString: number = this.bStringUtil.parseBString(appt);

    try {
      this.testViabilityAndCompute(parsedApptBString, parsedToTest);
    } catch (error) {
      throw error;
    }

    try {
      const update: number = this.testViabilityAndCompute(parsedApptBString, parsedToModify);

      return this.bStringUtil.decimalToBString(update);
    } catch (error) {
      throw error;
    }
  }

  /**
   *  @description Tests that two time intervals do not overlap
   *
   *  @param {number} binary1 first time interval
   *  @param {number} binary2 second time interval
   *
   *  @throws {Error} Time intervals overlap
   *  @returns {number} number
   */
  public testViabilityAndCompute(binary1: number, binary2: number): number {
    const modified: number = binary1 ^ binary2;
    const test: number = binary1 | binary2;

    if (modified === test) {
      return modified;
    }

    throw new Error(`BScheduleUtil Error: Time intervals overlap.`);
  }

  /**
   *  @description Tests removal a give time slot from a given time interval
   *  and if valid removes it
   *
   *  NB: This is also used for calculating remaining availability
   *
   *  @param {Appointment} timeSlotToDelete timeSlot to delete
   *  @param {string} scheduleSlot time interval to remove timeSlotToDelete
   *
   *  @throws {Error} BScheduleError invalid appointment
   *  @throws {Error} invalid deletion, interval to delete occurs outside of schedule interval
   *  @returns {string} string of modified time interval
   */
  public deleteAppointment(timeSlotToDelete: Appointment, scheduleSlot: string): string {
    if (timeSlotToDelete.endTime < timeSlotToDelete.startTime) {
      throw new Error(`BSchedule Error: Invalid appointment passed to delete appointment: ${timeSlotToDelete.toString()}`);
    }

    const apptToDeleteBString: string = this.bStringUtil.generateBString(timeSlotToDelete);

    return this.deleteAppointmentBString(apptToDeleteBString, scheduleSlot);
  }

  /**
   *  @description Tests removal a given time slot from a given time interval
   *  and if valid removes it
   *
   *  NB: This is also used for calculating remaining availability
   *
   *  @param {string} bStringToDelete timeSlot to delete
   *  @param {string} scheduleSlot time interval to remove timeSlotToDelete
   *
   *  @throws {Error} invalid deletion, interval to delete occurs outside of schedule interval
   *  @returns {string} string of modified time interval
   */
  public deleteAppointmentBString(bStringToDelete: string, scheduleSlot: string): string {
    const apptMask: string[] = this.bStringUtil.timeStringSplit(
      bStringToDelete
    );
    const splitBookings: string[] = this.bStringUtil.timeStringSplit(scheduleSlot);
    const returnAppointment: string[] = [];

    for (let i = 0; i < hoursInDay; i++) {
      try {
        const currentInterval: string = this.deleteAppointmentInterval(
          apptMask[i],
          splitBookings[i]
        );

        returnAppointment.push(currentInterval);
      } catch (err) {
        // NB: Rethrow error
        throw err;
      }
    }

    return returnAppointment.join("");
  }

  /**
   *  @description Tests removal a given time slot from a given time interval
   *  and if valid removes it
   *
   *  NB: Deleted appts can restore availability not add new availability
   *      as appts can only be created where the is availability and
   *      availability cannot be deleted when there is a concurrent appt
   *
   *  @param {string} timeSlotBString timeSlot to delete
   *  @param {string} scheduleSlot time interval to remove timeSlotToDelete
   *
   *  @throws  {Error} invalid deletion, interval to delete occurs outside of schedule interval
   *  @returns {string} string of modified time interval
   */
  public deleteAppointmentInterval(timeSlotBString: string, scheduleInterval: string): string {
    const parsedSchedule: number = this.bStringUtil.parseBString(scheduleInterval);
    const parsedApptBString: number = this.bStringUtil.parseBString(timeSlotBString);

    if (!this.validDeletion(parsedSchedule, parsedApptBString)) {
      throw new Error(
        `BScheduleUtil Error: invalid deletion, interval to delete occurs outside of schedule interval. To be deleted: ${timeSlotBString} Schedule: ${scheduleInterval}`
      );
    }
    // Performs a XOR on the schedule and the proposed schedule
    const modified: number = parsedSchedule ^ parsedApptBString;

    return this.bStringUtil.decimalToBString(modified);
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