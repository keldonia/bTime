import { Schedule, Appointment, hoursInDay} from './../../src/@types/index';
import { BinaryStringUtil } from './../../src/binaryTime/binaryStringUtil';

const binaryStringUtil: BinaryStringUtil = new BinaryStringUtil(5);

export function generateMockUTCDate(hour: number, minute: number, day: number = 0): Date {
  return ({
    getUTCHours: () => hour,
    getUTCMinutes: () => minute,
    getUTCDay: () => day,
    getUTCDate: () => day,
    getUTCFullYear: () => 2020,
    getUTCMonth: () => 2
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
    startTime: this.generateMockUTCDate(hour1, minute1, day1),
    endTime: this.generateMockUTCDate(hour2, minute2, day2),
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
  return binaryStringUtil['emptyDay'].slice();
};

export function fullDay(): string {
  return '1'.repeat(binaryStringUtil['intervalsInHour'] * hoursInDay);
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
  const dayZeroString: string = binaryStringUtil.generateBinaryString(dayZero) as string;
  const dayOneString: string = binaryStringUtil.generateBinaryString(dayOne) as string;
  const scheduleSlots: string[] = [ dayZeroString, dayOneString ];
  
  if (dayTwo) {
    const dayTwoString: string = binaryStringUtil.generateBinaryString(dayTwo) as string;
    scheduleSlots.push(dayTwoString);
  } else {
    scheduleSlots.push(emptyDay());
  }

  if (dayThree) {
    const dayThreeString: string = binaryStringUtil.generateBinaryString(dayThree) as string;
    scheduleSlots.push(dayThreeString);
  } else {
    scheduleSlots.push(emptyDay());
  }

  if (dayFour) {
    const dayFourString: string = binaryStringUtil.generateBinaryString(dayFour) as string;
    scheduleSlots.push(dayFourString);
  } else {
    scheduleSlots.push(emptyDay());
  }

  if (dayFive) {
    const dayFiveString: string = binaryStringUtil.generateBinaryString(dayFive) as string;
    scheduleSlots.push(dayFiveString);
  } else {
    scheduleSlots.push(emptyDay());
  }

  if (daySix) {
    const daySixString: string = binaryStringUtil.generateBinaryString(daySix) as string;
    scheduleSlots.push(daySixString);
  } else {
    scheduleSlots.push(emptyDay());
  }

  return scheduleSlots;
}