// Define time constants
export const daysInWeek: number = 7;
export const hoursInDay: number = 24;
export const minutesInHour: number = 60;

// Binary is in base 2
export const binaryBase: number = 2;

export interface Appointment {
  startTime: Date,
  endTime: Date
}

export interface AppointmentDuo {
  initialAppointment: Appointment,
  secondAppointment: Appointment
}

export interface Schedule {
  schedule: string[], // This indexes 0-6, starting (0) with Sunday
  bookings: string[], // This indexes 0-6, starting (0) with Sunday
  weekStart: Date
}

export interface AppointmentSchedule {
  schedule: Appointment[][], // This indexes 0-6, starting (0) with Sunday
  bookings: Appointment[][], // This indexes 0-6, starting (0) with Sunday
  availability: Appointment[][], // This indexes 0-6, starting (0) with Sunday
  weekStart: Date
}

export enum ScheduleActions {
  'DELETE_APPT',
  'BOOKING_UPDATE',
  'UNKOWN'
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