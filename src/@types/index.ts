import { Moment } from "moment";

// Define time constants
export const daysInWeek: number = 7;
export const hoursInDay: number = 24;
export const minutesInHour: number = 60;

// Binary is in base 2
export const binaryBase: number = 2;

export interface MomentAppointment {
  startTime: Moment,
  endTime: Moment
}

export interface Schedule {
  schedule: string[], // This indexes 0-6, starting (0) with Sunday
  bookings: string[], // This indexes 0-6, starting (0) with Sunday
  weekStart: Moment
}

export enum ScheduleActions {
  DELETE_APPT,
  BOOKING_UPDATE
}

export const validTimeIntervals: Set<number> = new Set([
  1,
  2,
  3,
  4,
  5,
  6,
  10,
  12,
  15,
  20,
  30,
  60
]);