import { Moment } from "moment";

// Define time constants
export const hoursInDay: number = 24;
export const minutesInHour: number = 60;

// Binary is in base 2
export const binaryBase: number = 2;

export interface MomentAppointment {
    startTime: Moment,
    endTime: Moment
}