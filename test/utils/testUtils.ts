import { Schedule, Appointment, hoursInDay, AppointmentSchedule} from './../../src/@types/index';
import { BStringUtil } from '../../src/bTime/bStringUtil';

const bStringUtil: BStringUtil = new BStringUtil(5);
const millisecondsInMinute: number = 60000;
const millisecondsInHour: number = millisecondsInMinute * 60;
const millisecondsInDay: number = millisecondsInHour * hoursInDay;

export function generateMockUTCDate(hour: number, minute: number, day: number = 0): Date {
  return ({
    getUTCHours: () => hour,
    getUTCMinutes: () => minute,
    getUTCDay: () => day,
    getUTCDate: () => day,
    getUTCFullYear: () => 2020,
    getUTCMonth: () => 2,
    toUTCString: () => `${day}/${2}/${2020}T${hour}:${minute}`,
    valueOf: () => (day * millisecondsInDay) + (hour * millisecondsInHour) + (minute * millisecondsInMinute)
  }) as Date;
}

export function generateMockDateAppointment(
  hour1: number, 
  minute1: number, 
  hour2: number, 
  minute2: number,
  day1: number = 0,
  day2: number = 0
): Appointment {
  return ({
    startTime: generateMockUTCDate(hour1, minute1, day1),
    endTime: generateMockUTCDate(hour2, minute2, day2),
    toString: () => `start: ${hour1}:${minute1} on ${day1} :: end: ${hour2}:${minute2} on ${day2}`
  }) as Appointment;
}

// NB: We are converting all times to UTC
export function generateSimpleDateAppointment(appointmentStart: Date): Appointment {
  const apptStartUtc: Date = new Date(Date.UTC(
    appointmentStart.getUTCFullYear(), 
    appointmentStart.getUTCMonth(), 
    appointmentStart.getUTCDate(),
    appointmentStart.getUTCHours(),
    appointmentStart.getUTCMinutes()
  ));

  /** 
   * NB: If a parameter is outside of the expected range, the UTC() method updates 
   * the other parameters to accommodate the value. For example, if 15 is used for month, 
   * the year will be incremented by 1 (year + 1) and 3 will be used for the month. 
   * */ 
  const appEndUtc: Date = new Date(Date.UTC(
    appointmentStart.getUTCFullYear(), 
    appointmentStart.getUTCMonth(), 
    appointmentStart.getUTCDate(),
    appointmentStart.getUTCHours() + 1,
    appointmentStart.getUTCMinutes()
  ));
  const apptObj: Appointment = {
    startTime: apptStartUtc,
    endTime: appEndUtc
  };

  return apptObj;
}

export function generateSchedule(
  schedule: string[], 
  bookings: string[], 
  weekStart: Date = generateMockUTCDate(0, 1, 0)
): Schedule {
  return {
    schedule: schedule,
    bookings: bookings,
    weekStart: weekStart
  };
}

// Exposing for certain tests
export function emptyDay(): string {
  return bStringUtil['emptyDay'].slice();
};

export function fullDay(): string {
  return '1'.repeat(bStringUtil['intervalsInHour'] * hoursInDay);
}

export function emptyWeek(): string[] {
  return new Array(7).fill(emptyDay());
};

export function emptyAppointmentWeek(): Appointment[][] {
  return new Array(7).fill(new Array());
}

// TODO: Should this be made a general utility, or extended further...
export function generateTimeSet(
  dayZero: Appointment,
  dayOne: Appointment,
  dayTwo?: Appointment,
  dayThree?: Appointment,
  dayFour?: Appointment,
  dayFive?: Appointment,
  daySix?: Appointment
): string[] {
  const dayZeroString: string = bStringUtil.generateBinaryString(dayZero) as string;
  const dayOneString: string = bStringUtil.generateBinaryString(dayOne) as string;
  const scheduleSlots: string[] = [ dayZeroString, dayOneString ];
  
  if (dayTwo) {
    const dayTwoString: string = bStringUtil.generateBinaryString(dayTwo) as string;
    scheduleSlots.push(dayTwoString);
  } else {
    scheduleSlots.push(emptyDay());
  }

  if (dayThree) {
    const dayThreeString: string = bStringUtil.generateBinaryString(dayThree) as string;
    scheduleSlots.push(dayThreeString);
  } else {
    scheduleSlots.push(emptyDay());
  }

  if (dayFour) {
    const dayFourString: string = bStringUtil.generateBinaryString(dayFour) as string;
    scheduleSlots.push(dayFourString);
  } else {
    scheduleSlots.push(emptyDay());
  }

  if (dayFive) {
    const dayFiveString: string = bStringUtil.generateBinaryString(dayFive) as string;
    scheduleSlots.push(dayFiveString);
  } else {
    scheduleSlots.push(emptyDay());
  }

  if (daySix) {
    const daySixString: string = bStringUtil.generateBinaryString(daySix) as string;
    scheduleSlots.push(daySixString);
  } else {
    scheduleSlots.push(emptyDay());
  }

  return scheduleSlots;
}

export function generateTestSchedule() {
  const dayZeroSchedule: Appointment = generateMockDateAppointment(8, 0, 18, 0, 0, 0);
  const dayOneSchedule: Appointment = generateMockDateAppointment(9, 0, 17, 0, 1, 1);
  const scheduledAvailability: string[] = generateTimeSet(
    dayZeroSchedule, 
    dayOneSchedule, 
    dayOneSchedule, 
    dayOneSchedule,
    dayOneSchedule,
    dayOneSchedule,
    dayOneSchedule
  );

  const dayZeroBookings: Appointment = generateMockDateAppointment(8, 0, 18, 0, 0, 0);
  const dayOneBookings: Appointment = generateMockDateAppointment(11, 0, 17, 0, 1, 1);
  const bookings: string[] = generateTimeSet(
    dayZeroBookings, 
    dayOneBookings
  );

  return generateSchedule(scheduledAvailability, bookings);
}

export function generateTestAppointmentSchedule() {
  const dayZeroSchedule: Appointment = generateMockDateAppointment(8, 0, 18, 0, 0, 0);
  const dayOneSchedule: Appointment = generateMockDateAppointment(10, 0, 18, 0, 0, 0);
  const dayTwoSchedule: Appointment = generateMockDateAppointment(9, 0, 17, 0, 1, 1);
  const schedule: Appointment[][] = [
    [dayZeroSchedule],
    [dayOneSchedule],
    [dayTwoSchedule],
    [dayTwoSchedule],
    [dayTwoSchedule],
    [dayTwoSchedule],
    [dayTwoSchedule]
  ];
  const dayZeroBookings: Appointment = generateMockDateAppointment(8, 0, 18, 0, 0, 0);
  const dayOneBookings: Appointment = generateMockDateAppointment(11, 0, 17, 0, 1, 1);
  const bookings: Appointment[][] =  [
    [dayZeroBookings], 
    [dayOneBookings],
    [],
    [],
    [],
    [],
    []
  ];

  return {
    schedule,
    bookings,
    availability: [[],[],[],[],[],[],[]],
    weekStart: generateMockUTCDate(0, 1, 0)
  } as AppointmentSchedule;
}