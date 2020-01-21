import { MomentAppointment } from './../../src/@types/index';
import moment = require('moment');

export class TestUtils {

  generateMockMoment(hour: number, minute: number) {
    return ({
      hour: () => hour,
      minute: () => minute
    });
  }

  generateMockAppointment(
    hour1: number, 
    minute1: number, 
    hour2: number, 
    minute2: number
  ): MomentAppointment {
    return ({
      startTime: this.generateMockMoment(hour1, minute1),
      endTime: this.generateMockMoment(hour2, minute2)
    }) as MomentAppointment;
  }

  // NB: We are converting all times to UTC
  generateSimpleMomentAppointment(appointmentStart: Date): MomentAppointment {
    const apptStartUtc: moment.Moment = moment(appointmentStart).utc();
    const appEndUtc: moment.Moment = moment(appointmentStart).utc().add(1, "h");
    const apptObj: MomentAppointment = {
      startTime: apptStartUtc,
      endTime: appEndUtc
    };

    return apptObj;
  }
};