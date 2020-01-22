import { MomentAppointment, Schedule } from './../../src/@types/index';
import * as moment from 'moment';

export function generateMockMoment(hour: number, minute: number, day: number = 1) {
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
  day1: number = 1,
  day2: number = 1
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

export function generateSchedule(): Schedule {
  const schedule: Schedule = {
    schedule: [],
    bookings: [],
    weekStart: this.generateMockMoment(0, 1, 1);
  };

  return schedule;
}