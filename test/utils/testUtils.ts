import { MomentAppointment, Schedule } from './../../src/@types/index';
import { BinaryStringUtil } from './../../src/binaryTime/binaryStringUtil';
import * as moment from 'moment';

const binaryStringUtil: BinaryStringUtil = new BinaryStringUtil(5);

export function generateMockMoment(hour: number, minute: number, day: number = 0): moment.Moment {
  return ({
    hour: () => hour,
    minute: () => minute,
    day: () => day,
    toString: () => `${hour}:${minute} on ${day}`,
    diff: (moment2: moment.Moment) => day - moment2.day()
  }) as moment.Moment;
}

export function generateMockAppointment(
  hour1: number, 
  minute1: number, 
  hour2: number, 
  minute2: number,
  day1: number = 0,
  day2: number = 0
): MomentAppointment {
  return ({
    startTime: this.generateMockMoment(hour1, minute1, day1),
    endTime: this.generateMockMoment(hour2, minute2, day2),
    toString: () => `start: ${hour1}:${minute1} on ${day1} :: end: ${hour2}:${minute2} on ${day2}`
  }) as MomentAppointment;
}

// NB: We are converting all times to UTC
export function generateSimpleMomentAppointment(appointmentStart: Date): MomentAppointment {
  const apptStartUtc: moment.Moment = moment(appointmentStart).utc();
  const appEndUtc: moment.Moment = moment(apptStartUtc.add(1, 'h'));
  const apptObj: MomentAppointment = {
    startTime: apptStartUtc,
    endTime: appEndUtc
  };

  return apptObj;
}

export function generateSchedule(
  schedule: string[], 
  bookings: string[], 
  weekStart: moment.Moment = generateMockMoment(0, 1, 0)
): Schedule {
  return {
    schedule: schedule,
    bookings: bookings,
    weekStart: weekStart
  };
}

// TODO: Should this be made a general utility, or extended further...
export function generateTimeSet(
  dayZero: MomentAppointment,
  dayOne: MomentAppointment,
  dayTwo?: MomentAppointment,
  dayThree?: MomentAppointment,
  dayFour?: MomentAppointment,
  dayFive?: MomentAppointment,
  daySix?: MomentAppointment
): string[] {
  const dayZeroString: string = binaryStringUtil.generateBinaryString(dayZero) as string;
  const dayOneString: string = binaryStringUtil.generateBinaryString(dayOne) as string;
  const scheduleSlots: string[] = [ dayZeroString, dayOneString ];
  
  if (dayTwo) {
    const dayTwoString: string = binaryStringUtil.generateBinaryString(dayTwo) as string;
    scheduleSlots.push(dayTwoString);
  }

  if (dayThree) {
    const dayThreeString: string = binaryStringUtil.generateBinaryString(dayThree) as string;
    scheduleSlots.push(dayThreeString);
  }

  if (dayFour) {
    const dayFourString: string = binaryStringUtil.generateBinaryString(dayFour) as string;
    scheduleSlots.push(dayFourString);
  }

  if (dayFive) {
    const dayFiveString: string = binaryStringUtil.generateBinaryString(dayFive) as string;
    scheduleSlots.push(dayFiveString);
  }

  if (daySix) {
    const daySixString: string = binaryStringUtil.generateBinaryString(daySix) as string;
    scheduleSlots.push(daySixString);
  }

  return scheduleSlots;
}