import { Scheduler, BTimeFactory } from '../src';
import * as TestUtils from './utils/testUtils';
import { Schedule, ScheduleActions, Appointment, AppointmentDuo, AppointmentSchedule } from '../src/@types';
import { BStringUtil } from '../src/bTime/bStringUtil';

describe('Test Scheduler', () => {

  describe('#composeAppointments', () => {
    const scheduler: Scheduler = new Scheduler(5);

    it('should properly create the appointmentDuo splitting the appt on the day boundary', () => {
      const apptToBook: Appointment = {
        startTime: new Date('2011-10-10T23:30:00Z'),
        endTime: new Date('2011-10-11T00:30:00Z')
      };

      const expectedAppt: Appointment = {
        startTime: apptToBook.startTime,
        endTime: new Date(
          Date.UTC(
            apptToBook.startTime.getUTCFullYear(),
            apptToBook.startTime.getUTCMonth(),
            apptToBook.startTime.getUTCDate(),
            23,
            59
          )
        )
      };
  
      const expectedSecondAppt: Appointment = {
        startTime: new Date(
          Date.UTC(
            apptToBook.endTime.getUTCFullYear(),
            apptToBook.endTime.getUTCMonth(),
            apptToBook.endTime.getUTCDate(),
            0,
            0
          )
        ),
        endTime: apptToBook.endTime
      }

      const appointmentDuo: AppointmentDuo = scheduler.composeAppointments(apptToBook);

      expect(appointmentDuo.initialAppointment.startTime.valueOf()).toEqual(expectedAppt.startTime.valueOf());
      expect(appointmentDuo.initialAppointment.endTime.valueOf()).toEqual(expectedAppt.endTime.valueOf());
      expect(appointmentDuo.secondAppointment.startTime.valueOf()).toEqual(expectedSecondAppt.startTime.valueOf());
      expect(appointmentDuo.secondAppointment.endTime.valueOf()).toEqual(expectedSecondAppt.endTime.valueOf());
    });
  });

  describe('#getCurrentAvailability', () => {
    const scheduler: Scheduler = new Scheduler(5);
    const emptyBookings: string[] = TestUtils.emptyWeek();

    it('should return the no remaining availability, if there is no availabilty or bookings', () => {
      const scheduledAvailability: string[] = emptyBookings;
      const bookings: string[] = emptyBookings;
      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const computedAvailability: string[] = scheduler.getCurrentAvailability(schedule) as string[];

      expect(computedAvailability).toMatchObject(emptyBookings);
    });

    it('should return the original availability if there are no bookings', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(
        dayZeroSchedule, 
        dayOneSchedule, 
        dayOneSchedule, 
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule
      );
      const bookings: string[] = emptyBookings;
      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);
      
      const computedAvailability: string[] = scheduler.getCurrentAvailability(schedule) as string[];

      expect(computedAvailability).toMatchObject(scheduledAvailability);
    });

    it('should return no remaining availity, if the availabiltiy and bookings exactly match', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(
        dayZeroSchedule, 
        dayOneSchedule, 
        dayOneSchedule, 
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule
      );
      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, scheduledAvailability);

      const computedAvailability: string[] = scheduler.getCurrentAvailability(schedule) as string[];

      expect(computedAvailability).toMatchObject(emptyBookings);
    });

    it('should return the expected availabiltiy if there is availability and bookings', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(
        dayZeroSchedule, 
        dayOneSchedule, 
        dayOneSchedule, 
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule
      );

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 17, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(
        dayZeroBookings, 
        dayOneBookings
      );
      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const expectedDayOne: Appointment = TestUtils.generateMockDateAppointment(17, 5, 18, 0, 0, 0);
      const expectedDayTwo: Appointment = TestUtils.generateMockDateAppointment(9, 0, 10, 55, 1, 1);
      const expectedTimeSet: string[] = TestUtils.generateTimeSet(
        expectedDayOne,
        expectedDayTwo,
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule
      );

      const computedAvailability: string[] = scheduler.getCurrentAvailability(schedule) as string[];

      expect(computedAvailability).toMatchObject(expectedTimeSet);
    });

    it('should return false if an invalid schedule is passed', () => {
      const scheduledAvailability: string[] = emptyBookings;
      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(
        dayZeroBookings, 
        dayOneBookings, 
        dayOneBookings, 
        dayOneBookings,
        dayOneBookings,
        dayOneBookings,
        dayOneBookings
      );
      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);
      
      expect(() => scheduler.getCurrentAvailability(schedule))
        .toThrow('BSchedule Error: Time intervals overlap on hour: 8 of day: 0 of the week starting on 0/2/2020T0:1');
    });
  });

  describe('#convertScheduleToAppointmentSchedule', () => {
    const scheduler: Scheduler = new Scheduler(5);
    const baseDate: Date = new Date('2020-02-09T00:00:00Z');

    it('should throw an error if the bookings do not fit in the schedule', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(12, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(
        dayZeroSchedule, 
        dayOneSchedule, 
        dayOneSchedule, 
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule
      );

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      function test() {
        scheduler.convertScheduleToAppointmentSchedule(schedule);
      }

      expect(test).toThrow(`BScheduler Error: Was unable to convert schedule to appointment schedule, as the bookings do not fit in the schedule`);
    });

    it('should return the appropriate appointment schedule', () => {
      const schedule: Schedule = TestUtils.generateSchedule(
        TestUtils.emptyWeek(),
        TestUtils.emptyWeek(),
        baseDate
      );
      const expectedAppointmentSchedule: AppointmentSchedule = {
        schedule: TestUtils.emptyAppointmentWeek(),
        bookings: TestUtils.emptyAppointmentWeek(),
        availability: TestUtils.emptyAppointmentWeek(),
        weekStart: baseDate
      };
      const computedSchedule: AppointmentSchedule = scheduler.convertScheduleToAppointmentSchedule(schedule);
      
      expect(computedSchedule).toEqual(expectedAppointmentSchedule);
    });
  });

  describe('#updateScheduleWithAppointmentSchedule', () => {
    const scheduler: Scheduler = new Scheduler(5);
    // eslint-disable-next-line
    const bTimeFactory: BTimeFactory = scheduler['bTimeFactory'] as any as BTimeFactory;

    const mockGenerateBStringFromAppointments: jest.Mock = jest.fn();
    const mockUpdateSchedule: jest.Mock = jest.fn();
    const mockGetCurrentAvailability: jest.Mock = jest.fn();
    const mockConvertScheduleToAppointmentSchedule: jest.Mock = jest.fn();

    scheduler.updateSchedule = mockUpdateSchedule;
    scheduler.getCurrentAvailability = mockGetCurrentAvailability;
    bTimeFactory.generateBStringFromAppointments = mockGenerateBStringFromAppointments;
    bTimeFactory.convertScheduleToAppointmentSchedule = mockConvertScheduleToAppointmentSchedule;

    let schedule: Schedule;
    let appointmentSchedule: AppointmentSchedule;

    beforeEach(() => {
      jest.resetAllMocks();
      schedule = TestUtils.generateTestSchedule();
      appointmentSchedule = TestUtils.generateTestAppointmentSchedule();
    });

    it('should properly flatten the schedule', () => {
      const mockErrorMessage: string = 'mock error'
      mockGenerateBStringFromAppointments.mockImplementation(() => { 
        throw new Error(mockErrorMessage); 
      });
      
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(10, 0, 18, 0, 0, 0);
      const dayTwoSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const expectedFlattenedSchedule: Appointment[] = [
        dayZeroSchedule,
        dayOneSchedule,
        dayTwoSchedule,
        dayTwoSchedule,
        dayTwoSchedule,
        dayTwoSchedule,
        dayTwoSchedule
      ];
      const testSchedule: Appointment[][] = [
        [dayZeroSchedule],
        [dayOneSchedule],
        [dayTwoSchedule],
        [dayTwoSchedule],
        [dayTwoSchedule],
        [dayTwoSchedule],
        [dayTwoSchedule]
      ];
      appointmentSchedule.schedule = testSchedule;

      expect(() => scheduler.updateScheduleWithAppointmentSchedule(appointmentSchedule, schedule))
        .toThrow(mockErrorMessage);

      expect(mockGenerateBStringFromAppointments).toBeCalled();
      expect(mockGenerateBStringFromAppointments).toBeCalledWith(expectedFlattenedSchedule);
      expect(mockUpdateSchedule).not.toBeCalled();
      expect(mockGetCurrentAvailability).not.toBeCalled();
      expect(mockConvertScheduleToAppointmentSchedule).not.toBeCalled();
    })

    it('should return false if a binaryString representation of the schedule is unable to be created', () => {
      const mockErrorMessage: string = 'mock error'
      mockGenerateBStringFromAppointments.mockImplementation(() => { 
        throw new Error(mockErrorMessage); 
      });

      expect(() => scheduler.updateScheduleWithAppointmentSchedule(appointmentSchedule, schedule))
        .toThrow(mockErrorMessage);

      expect(mockGenerateBStringFromAppointments).toBeCalled();
      expect(mockUpdateSchedule).not.toBeCalled();
      expect(mockGetCurrentAvailability).not.toBeCalled();
      expect(mockConvertScheduleToAppointmentSchedule).not.toBeCalled();
    });

    it(`should return false if the proposed schedule won't contain current bookings`, () => {
      mockGenerateBStringFromAppointments.mockReturnValueOnce(true);
      const mockErrorMsg: string = 'Mock Error';
      mockUpdateSchedule.mockImplementation(() => { throw new Error(mockErrorMsg) } );

      expect(() => scheduler.updateScheduleWithAppointmentSchedule(appointmentSchedule, schedule))
        .toThrow(mockErrorMsg);
      expect(mockGenerateBStringFromAppointments).toBeCalled();
      expect(mockUpdateSchedule).toBeCalled();
      expect(mockGetCurrentAvailability).not.toBeCalled();
      expect(mockConvertScheduleToAppointmentSchedule).not.toBeCalled();
    });

    it(`should return false if the proposed schedule won't contain current bookings, availabilty test`, () => {
      mockGenerateBStringFromAppointments.mockReturnValueOnce(true);
      mockUpdateSchedule.mockReturnValueOnce(true);
      const mockErrorMsg: string = 'Mock Error';
      mockGetCurrentAvailability.mockImplementation(() => { throw new Error(mockErrorMsg) } );

      expect(() => scheduler.updateScheduleWithAppointmentSchedule(appointmentSchedule, schedule))
        .toThrow(mockErrorMsg);
      expect(mockGenerateBStringFromAppointments).toBeCalled();
      expect(mockUpdateSchedule).toBeCalled();
      expect(mockUpdateSchedule).toMatchSnapshot();
      expect(mockGetCurrentAvailability).toBeCalled();
      expect(mockConvertScheduleToAppointmentSchedule).not.toBeCalled();
    });


    it(`should call convertScheduleToAppointmentSchedule, if none of the checks fail`, () => {
      mockGenerateBStringFromAppointments.mockReturnValueOnce(true);
      mockUpdateSchedule.mockReturnValueOnce(true);
      mockGetCurrentAvailability.mockReturnValueOnce(true);

      scheduler.updateScheduleWithAppointmentSchedule(appointmentSchedule, schedule);

      expect(mockGenerateBStringFromAppointments).toBeCalled();
      expect(mockUpdateSchedule).toBeCalled();
      expect(mockGetCurrentAvailability).toBeCalled();
      expect(mockConvertScheduleToAppointmentSchedule).toBeCalled();
    });
  });

  describe('#updateSchedule', () => {
    const scheduler: Scheduler = new Scheduler(5);
    const bStringUtil: BStringUtil = new BStringUtil(5);
    const emptyBookings: string[] = TestUtils.emptyWeek();

    it('should return the modified schedule if the current bookings are contained within the proposed availability', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(
        dayZeroSchedule, 
        dayOneSchedule, 
        dayOneSchedule, 
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule
      );

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(
        dayZeroBookings, 
        dayOneBookings
      );

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const proposedDayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 20, 0, 0, 0);
      const proposedDayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 18, 0, 0, 0);
      const proposedAvailability: string[] = TestUtils.generateTimeSet(
        proposedDayZeroSchedule, 
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule
      );

      const proposedSchedule: Schedule = TestUtils.generateSchedule(proposedAvailability, emptyBookings);
      
      const expectedSchedule: Schedule = {
        schedule: proposedAvailability,
        bookings: bookings,
        weekStart: schedule.weekStart
      };

      const computedSchedule: Schedule = scheduler.updateSchedule(proposedSchedule, schedule) as Schedule;

      expect(computedSchedule).toMatchObject(expectedSchedule);
    });

    it('should return the modified schedule if the current bookings are contained within the proposed availability, ignoring if the schedule has additional days', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(
        dayZeroSchedule, 
        dayOneSchedule, 
        dayOneSchedule, 
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule
      );
      scheduledAvailability.push(bStringUtil.generateBString(dayOneSchedule) as string);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(
        dayZeroBookings, 
        dayOneBookings
      );

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const proposedDayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 20, 0, 0, 0);
      const proposedDayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 18, 0, 0, 0);
      const proposedAvailability: string[] = TestUtils.generateTimeSet(
        proposedDayZeroSchedule, 
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule
      );

      const proposedSchedule: Schedule = TestUtils.generateSchedule(proposedAvailability, emptyBookings);
      
      const expectedSchedule: Schedule = {
        schedule: proposedAvailability,
        bookings: bookings,
        weekStart: schedule.weekStart
      };

      const computedSchedule: Schedule = scheduler.updateSchedule(proposedSchedule, schedule) as Schedule;

      expect(computedSchedule).toMatchObject(expectedSchedule);
    });

    it('should return false if the current bookings are not contained within the proposed availability, empty hour', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(
        dayZeroSchedule, 
        dayOneSchedule, 
        dayOneSchedule, 
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule
      );

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const proposedDayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(12, 0, 18, 0, 0, 0);
      const proposedDayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 18, 0, 0, 0);
      const proposedAvailability: string[] = TestUtils.generateTimeSet(
        proposedDayZeroSchedule, 
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule
      );
      
      const proposedSchedule: Schedule = TestUtils.generateSchedule(proposedAvailability, emptyBookings);

      expect(() => scheduler.updateSchedule(proposedSchedule, schedule))
        .toThrow('BScheduleUtil Error: Time intervals overlap.');
    });

    it('should return false if the current bookings are not contained within the proposed availability, non-empty hour', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(
        dayZeroSchedule, 
        dayOneSchedule, 
        dayOneSchedule, 
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule
      );

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(12, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const proposedDayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(12, 30, 18, 0, 0, 0);
      const proposedDayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 18, 0, 0, 0);
      const proposedAvailability: string[] = TestUtils.generateTimeSet(
        proposedDayZeroSchedule, 
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule
      );
      
      const proposedSchedule: Schedule = TestUtils.generateSchedule(proposedAvailability, emptyBookings);

      expect(() => scheduler.updateSchedule(proposedSchedule, schedule))
        .toThrow('BScheduleUtil Error: Time intervals overlap.')
    });

    it('should ignore any additional intervals outside of the day', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(
        dayZeroSchedule, 
        dayOneSchedule, 
        dayOneSchedule, 
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule,
        dayOneSchedule
      );

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(
        dayZeroBookings, 
        dayOneBookings
      );

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);
      // Add a 25th hour to the first day
      schedule.schedule[0] = bStringUtil.generateBString(dayZeroSchedule) as string + "101010101010";
      schedule.bookings[0] = bStringUtil.generateBString(dayZeroBookings) as string + "101010101010";

      const proposedDayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 20, 0, 0, 0);
      const proposedDayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 18, 0, 0, 0);
      const proposedAvailability: string[] = TestUtils.generateTimeSet(
        proposedDayZeroSchedule, 
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule,
        proposedDayOneSchedule
      );

      const proposedSchedule: Schedule = TestUtils.generateSchedule(proposedAvailability, emptyBookings);
      // Add a 25th hour to the first day
      const badAvail: string = bStringUtil.generateBString(proposedDayZeroSchedule) as string + "001010101010"; 
      proposedSchedule.schedule[0] = badAvail;
      proposedSchedule.bookings[0] = schedule.bookings[0];

      const computedSchedule: Schedule = scheduler.updateSchedule(proposedSchedule, schedule) as Schedule;

      const expectedSchedule: Schedule = {
        schedule: proposedAvailability.slice(),
        bookings: bookings.slice(),
        weekStart: schedule.weekStart
      };
      // Correct expected availability & bookings
      const expectedAvailibility: string = bStringUtil.generateBString(proposedDayZeroSchedule) as string;
      expectedSchedule.schedule[0] = expectedAvailibility;
      expectedSchedule.bookings[0] = bStringUtil.generateBString(dayZeroBookings) as string;

      expect(computedSchedule.schedule[0]).not.toEqual(badAvail)
      expect(computedSchedule.schedule[0]).toEqual(expectedAvailibility)
      expect(computedSchedule).toMatchObject(expectedSchedule);
    });
  });

  describe('#processAppointment', () => {
    const scheduler: Scheduler = new Scheduler(5);
    const mockDeleteAppointment: jest.Mock = jest.fn();
    const mockHandleBookingUpdate: jest.Mock = jest.fn();

    scheduler.deleteAppointment = mockDeleteAppointment;
    scheduler.handleBookingUpdate = mockHandleBookingUpdate;

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should call handleBookingUpdate with only one appointment if the appointment does not cross the day boundary', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);
      const apptToBook: Appointment = TestUtils.generateMockDateAppointment(10,0, 11, 0, 1, 1);

      const actionType: ScheduleActions = ScheduleActions.BOOKING_UPDATE;

      scheduler.processAppointment(apptToBook, schedule, actionType);

      expect(mockHandleBookingUpdate).toBeCalledWith(apptToBook, schedule, undefined);
    });

    it('should call handleBookingUpdate with two appointments if the appointment crosses the day boundary', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);
      const startTime: Date = new Date('2011-10-10T23:30:00Z');
      const endTime: Date = new Date('2011-10-11T00:30:00Z');
      const apptToBook: Appointment = {
        startTime,
        endTime
      };
      const actionType: ScheduleActions = ScheduleActions.BOOKING_UPDATE;

      const expectedAppt: Appointment = {
        startTime: startTime,
        endTime: new Date(Date.UTC(
          startTime.getUTCFullYear(), 
          startTime.getUTCMonth(), 
          startTime.getUTCDate(),
          23,
          59
        ))
      };
      const expectedSecondAppt: Appointment = {
        startTime: new Date(Date.UTC(
          startTime.getUTCFullYear(), 
          endTime.getUTCMonth(), 
          endTime.getUTCDate(),
          0,
          0
        )),
        endTime: apptToBook.endTime
      };

      scheduler.processAppointment(apptToBook, schedule, actionType);

      expect(mockHandleBookingUpdate).toBeCalledWith(expectedAppt, schedule, expectedSecondAppt);
    });

    it('should call delete appointment with only one appointment if the appointment does not cross the day boundary', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);
      const apptToBook: Appointment = TestUtils.generateMockDateAppointment(10, 0, 11, 0, 1, 1);

      const actionType: ScheduleActions = ScheduleActions.DELETE_APPT;

      scheduler.processAppointment(apptToBook, schedule, actionType);

      expect(mockDeleteAppointment).toBeCalledWith(apptToBook, schedule, undefined);
    });

    it('should call delete appointment with two appointments if the appointment crosses the day boundary', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);
      const startTime: Date = new Date('2011-10-10T23:30:00Z');
      const endTime: Date = new Date('2011-10-11T00:30:00Z');
      const apptToBook: Appointment = {
        startTime,
        endTime
      };
      const actionType: ScheduleActions = ScheduleActions.DELETE_APPT;

      const expectedAppt: Appointment = {
        startTime: startTime,
        endTime: new Date(Date.UTC(
          startTime.getUTCFullYear(), 
          startTime.getUTCMonth(), 
          startTime.getUTCDate(),
          23,
          59
        ))
      };
      const expectedSecondAppt: Appointment = {
        startTime: new Date(Date.UTC(
          startTime.getUTCFullYear(), 
          endTime.getUTCMonth(), 
          endTime.getUTCDate(),
          0,
          0
        )),
        endTime: apptToBook.endTime
      };

      scheduler.processAppointment(apptToBook, schedule, actionType);

      expect(mockDeleteAppointment).toBeCalledWith(expectedAppt, schedule, expectedSecondAppt);
    });

    it('should return false if passed an unknown action type', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);
      const apptToBook: Appointment = TestUtils.generateMockDateAppointment(10, 0, 11, 0, 1, 1);
      const actionType: ScheduleActions = ScheduleActions.UNKNOWN;

      expect(() => scheduler.processAppointment(apptToBook, schedule, actionType))
        .toThrow('BScheduler Error: Recieved invalid action type: UNKNOWN, raw type: 2')
      expect(mockDeleteAppointment).not.toBeCalled();
      expect(mockHandleBookingUpdate).not.toBeCalled();
    });
  });

  describe('#processAppointments', () => {
    const scheduler: Scheduler = new Scheduler(5);
    // eslint-disable-next-line
    const bStringUtil: BStringUtil = (scheduler['bTimeFactory'] as any as BTimeFactory)['bStringUtil'] as any as BStringUtil;
    const mockDeleteAppointments: jest.Mock = jest.fn();
    const mockHandleBookingUpdateBString: jest.Mock = jest.fn();

    scheduler.deleteAppointments = mockDeleteAppointments;
    scheduler.handleBookingUpdateBString = mockHandleBookingUpdateBString;

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should return throw an error if an appointment is invalid', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);
      const apptToBook: Appointment = TestUtils.generateMockDateAppointment(10, 0, 9, 0, 1, 1);


      expect(() => scheduler.processAppointments([apptToBook], schedule, ScheduleActions.BOOKING_UPDATE))
        .toThrow(`BString Error: Appointment can't end before it begins.  Appointment start: 1/2/2020T10:0 Appointment end: 1/2/2020T9:0`)
    });

    it('should throw an error if the appointment array is invalid', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);
      const apptToBook: Appointment = TestUtils.generateMockDateAppointment(10, 0, 12, 0, 1, 1);
      const apptToBookTwo: Appointment = TestUtils.generateMockDateAppointment(11, 0, 13, 0, 1, 1);
      const appointments: Appointment[] = [ apptToBook, apptToBookTwo ];

      expect(() => scheduler.processAppointments(appointments, schedule, ScheduleActions.BOOKING_UPDATE))
        .toThrow(`BString Error: Appointment can't begin before previous appointment ends.  Appointment start: 1/2/2020T11:0 Previous Appointment end: 1/2/2020T12:0`)
    });

    it('should return false if passed an unknown action type', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);
      const apptToBook: Appointment = TestUtils.generateMockDateAppointment(10, 0, 11, 0, 1, 1);
      const actionType: ScheduleActions = ScheduleActions.UNKNOWN;
      
      expect(() => scheduler.processAppointments([apptToBook], schedule, actionType))
        .toThrow('BScheduler Error: Recieved invalid action type: UNKNOWN, raw type: 2')
      expect(mockDeleteAppointments).not.toBeCalled();
      expect(mockHandleBookingUpdateBString).not.toBeCalled();
    });

    it('should call deleteAppointments if the appropriate action type is passed', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const apptToDelete: Appointment = TestUtils.generateMockDateAppointment(11, 0, 11, 55, 1, 1);
      const apptToDeleteTwo: Appointment = TestUtils.generateMockDateAppointment(16, 0, 17, 0, 1, 1);
      const appointments: Appointment[] = [ apptToDelete, apptToDeleteTwo ];
      const apptBStrings: string[] = bStringUtil.generateBStringFromAppointments(appointments) as string[];

      scheduler.processAppointments(appointments, schedule, ScheduleActions.DELETE_APPT);

      expect(mockDeleteAppointments).toBeCalledWith(apptBStrings, schedule);
    });

    it('should call handleBookingUpdateBString if the appropriate action type is passed', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const apptToDelete: Appointment = TestUtils.generateMockDateAppointment(11, 0, 11, 55, 1, 1);
      const apptToDeleteTwo: Appointment = TestUtils.generateMockDateAppointment(16, 0, 17, 0, 1, 1);
      const appointments: Appointment[] = [ apptToDelete, apptToDeleteTwo ];
      const apptBStrings: string[] = bStringUtil.generateBStringFromAppointments(appointments) as string[];

      scheduler.processAppointments(appointments, schedule, ScheduleActions.BOOKING_UPDATE);

      expect(mockHandleBookingUpdateBString).toBeCalledWith(apptBStrings, schedule);
    });
  });

  describe('#handleBookingUpdate',  () => {
    const scheduler: Scheduler = new Scheduler(5);
    const bStringUtil: BStringUtil = new BStringUtil(5);

    it(`should handle an appointment that doesn't cross the day boundary`, () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const apptToBook: Appointment = TestUtils.generateMockDateAppointment(10, 0, 10, 55, 1, 1);

      const dayOneExpectedBookings: Appointment = TestUtils.generateMockDateAppointment(10, 0, 17, 0, 1, 1);
      const expectedBookings: string = bStringUtil.generateBString(dayOneExpectedBookings) as string;

      const computedSchedule: Schedule = scheduler.handleBookingUpdate(apptToBook, schedule) as Schedule;

      // Only needs to test that the bookings on the appropriate day was correctly modified
      expect(computedSchedule.bookings[1]).toEqual(expectedBookings);
    });

    it('should throw an error if the appointment passed is not valid', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 23, 59, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(0, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 23, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(1, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const apptToBook: Appointment = TestUtils.generateMockDateAppointment(12, 0, 2, 0, 1, 1);

      expect(() => scheduler.handleBookingUpdate(apptToBook, schedule))
        .toThrow(`BString Error: Appointment can't end before it begins.  Appointment start: 1/2/2020T12:0 Appointment end: 1/2/2020T2:0`);
    });

    it('should return false if the appointment passed does not fit in the schedule', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 23, 59, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(0, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 23, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(1, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const apptToBook: Appointment = TestUtils.generateMockDateAppointment(0, 0, 2, 0, 1, 1);

      expect(() => scheduler.handleBookingUpdate(apptToBook, schedule))
        .toThrow('BSchedule Error: Time intervals overlap on 1/2/2020T0:0 for schedule starting on 0/2/2020T0:1');
    });

    it(`should handle an appointment that does cross the day boundary`, () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 23, 59, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(0, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 22, 55, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(1, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const firstApptToBook: Appointment = TestUtils.generateMockDateAppointment(23, 0, 23, 59, 0, 0);
      const apptToBook: Appointment = TestUtils.generateMockDateAppointment(0, 0, 0, 55, 1, 1);

      const dayZeroExpectedBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 23, 59, 0, 0);
      const expectedDayZeroBookings: string = bStringUtil.generateBString(dayZeroExpectedBookings) as string;

      const dayOneExpectedBookings: Appointment = TestUtils.generateMockDateAppointment(0, 0, 17, 0, 1, 1);
      const expectedDayOneBookings: string = bStringUtil.generateBString(dayOneExpectedBookings) as string;

      const computedSchedule: Schedule = scheduler.handleBookingUpdate(apptToBook, schedule, firstApptToBook) as Schedule;

      // Only needs to test that the bookings on the appropriate days were correctly modified
      expect(computedSchedule.bookings[0]).toEqual(expectedDayZeroBookings);
      expect(computedSchedule.bookings[1]).toEqual(expectedDayOneBookings);
    });

    it('should throw an error if a firstAppt is passed not a valid appointment', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 23, 59, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(0, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 23, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(1, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const firstApptToBook: Appointment = TestUtils.generateMockDateAppointment(23, 59, 23, 0, 0, 0);
      const apptToBook: Appointment = TestUtils.generateMockDateAppointment(0, 0, 1, 0, 1, 1);

      expect(() => scheduler.handleBookingUpdate(apptToBook, schedule, firstApptToBook))
        .toThrow(`BString Error: Appointment can't end before it begins.  Appointment start: 0/2/2020T23:59 Appointment end: 0/2/2020T23:0`)
    });

    it('should return false if a firstAppt passed does not fit in the schedule', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 23, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(0, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 23, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(1, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const firstApptToBook: Appointment = TestUtils.generateMockDateAppointment(23, 0, 23, 59, 0, 0);
      const apptToBook: Appointment = TestUtils.generateMockDateAppointment(0, 0, 1, 0, 1, 1);

      expect(() => scheduler.handleBookingUpdate(apptToBook, schedule, firstApptToBook))
        .toThrow('BSchedule Error: Time intervals overlap on 0/2/2020T23:0 for schedule starting on 0/2/2020T0:1');
    });
  });

  describe('#handleBookingUpdateBString', () => {
    const scheduler: Scheduler = new Scheduler(5);
    const bStringUtil: BStringUtil = new BStringUtil(5);

    it(`should handle an appointment that doesn't cross the day boundary`, () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const apptToBook: Appointment = TestUtils.generateMockDateAppointment(10, 0, 10, 55, 1, 1);
      const apptBStrings: string[] = bStringUtil.generateBStringFromAppointments([apptToBook]) as string[];

      const dayOneExpectedBookings: Appointment = TestUtils.generateMockDateAppointment(10, 0, 17, 0, 1, 1);
      const expectedBookings: string = bStringUtil.generateBString(dayOneExpectedBookings) as string;

      const computedSchedule: Schedule = scheduler.handleBookingUpdateBString(apptBStrings, schedule) as Schedule;

      // Only needs to test that the bookings on the appropriate day was correctly modified
      expect(computedSchedule.bookings[1]).toEqual(expectedBookings);
    });

    it('should return false if the appointment passed does not fit in the schedule', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 23, 59, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(0, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 23, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(1, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const apptToBook: Appointment = TestUtils.generateMockDateAppointment(0, 0, 2, 0, 1, 1);
      const apptBStrings: string[] = bStringUtil.generateBStringFromAppointments([apptToBook]) as string[];

      expect(() => scheduler.handleBookingUpdateBString(apptBStrings, schedule))
        .toThrow('BSchedule Error: time intervals overlap on day 1 of the week starting on 0/2/2020T0:1');
    });

    it(`should handle an appointment that does cross the day boundary`, () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 23, 59, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(0, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 22, 55, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(1, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const apptToBook: Appointment = TestUtils.generateMockDateAppointment(23, 0, 0, 55, 0, 1);
      const apptBStrings: string[] = bStringUtil.generateBStringFromAppointments([apptToBook]) as string[];

      const dayZeroExpectedBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 23, 59, 0, 0);
      const expectedDayZeroBookings: string = bStringUtil.generateBString(dayZeroExpectedBookings) as string;

      const dayOneExpectedBookings: Appointment = TestUtils.generateMockDateAppointment(0, 0, 17, 0, 1, 1);
      const expectedDayOneBookings: string = bStringUtil.generateBString(dayOneExpectedBookings) as string;

      const computedSchedule: Schedule = scheduler.handleBookingUpdateBString(apptBStrings, schedule) as Schedule;

      // Only needs to test that the bookings on the appropriate days were correctly modified
      expect(computedSchedule.bookings[0]).toEqual(expectedDayZeroBookings);
      expect(computedSchedule.bookings[1]).toEqual(expectedDayOneBookings);
    });

    it('should return false if a firstAppt passed does not fit in the schedule', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 23, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(0, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 23, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(1, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const apptToBook: Appointment = TestUtils.generateMockDateAppointment(23, 0, 1, 0, 0, 1);
      const apptBStrings: string[] = bStringUtil.generateBStringFromAppointments([apptToBook]) as string[];

      expect(() =>  scheduler.handleBookingUpdateBString(apptBStrings, schedule))
        .toThrow('BSchedule Error: time intervals overlap on day 0 of the week starting on 0/2/2020T0:1');
    });

    it('should handle multiple appointments', () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 23, 59, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(0, 0, 18, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 22, 55, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(1, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const apptToBook: Appointment = TestUtils.generateMockDateAppointment(23, 0, 0, 55, 0, 1);
      const apptToBookTwo: Appointment = TestUtils.generateMockDateAppointment(17, 5, 18, 0, 1, 1);
      const apptBStrings: string[] = bStringUtil.generateBStringFromAppointments([apptToBook, apptToBookTwo]) as string[];

      const dayZeroExpectedBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 23, 59, 0, 0);
      const expectedDayZeroBookings: string = bStringUtil.generateBString(dayZeroExpectedBookings) as string;

      const dayOneExpectedBookings: Appointment = TestUtils.generateMockDateAppointment(0, 0, 18, 0, 1, 1);
      const expectedDayOneBookings: string = bStringUtil.generateBString(dayOneExpectedBookings) as string;

      const computedSchedule: Schedule = scheduler.handleBookingUpdateBString(apptBStrings, schedule) as Schedule;

      // Only needs to test that the bookings on the appropriate days were correctly modified
      expect(computedSchedule.bookings[0]).toEqual(expectedDayZeroBookings);
      expect(computedSchedule.bookings[1]).toEqual(expectedDayOneBookings);
    });
  });

  describe('#deleteAppointment', () => {
    const scheduler: Scheduler = new Scheduler(5);
    const bStringUtil: BStringUtil = new BStringUtil(5);

    it(`should handle an appointment that doesn't cross the day boundary`, () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const apptToDelete: Appointment = TestUtils.generateMockDateAppointment(11,0, 11, 55, 1, 1);

      const dayOneExpectedBookings: Appointment = TestUtils.generateMockDateAppointment(12, 0, 17, 0, 1, 1);
      const expectedBookings: string = bStringUtil.generateBString(dayOneExpectedBookings) as string;

      const computedSchedule: Schedule = scheduler.deleteAppointment(apptToDelete, schedule) as Schedule;

      // Only needs to test that the bookings on the appropriate day was correctly modified
      expect(computedSchedule.bookings[1]).toEqual(expectedBookings);
    });

    it(`should handle an appointment that does cross the day boundary`, () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 23, 59, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(0, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 23, 59, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(0, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const firstApptToDelete: Appointment = TestUtils.generateMockDateAppointment(23, 0, 23, 59, 0, 0);
      const apptToDelete: Appointment = TestUtils.generateMockDateAppointment(0, 0, 0, 55, 1, 1);

      const dayZeroExpectedBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 22, 55, 0, 0);
      const expectedDayZeroBookings: string = bStringUtil.generateBString(dayZeroExpectedBookings) as string;

      const dayOneExpectedBookings: Appointment = TestUtils.generateMockDateAppointment(1, 0, 17, 0, 1, 1);
      const expectedDayOneBookings: string = bStringUtil.generateBString(dayOneExpectedBookings) as string;

      const computedSchedule: Schedule = scheduler.deleteAppointment(apptToDelete, schedule, firstApptToDelete) as Schedule;

      // Only needs to test that the bookings on the appropriate days were correctly modified
      expect(computedSchedule.bookings[0]).toEqual(expectedDayZeroBookings);
      expect(computedSchedule.bookings[1]).toEqual(expectedDayOneBookings);
    });

    it(`should return false if the deletion is invalid for one day`, () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const apptToDelete: Appointment = TestUtils.generateMockDateAppointment(9, 0, 11, 55, 1, 1);

      expect(() => scheduler.deleteAppointment(apptToDelete, schedule))
        .toThrow('Scheduler Error: Unable to delete appointment starting at 1/2/2020T9:0 and ending at 1/2/2020T11:55, occurs outside of schedule');
    });

    it(`should return false if the deletion is invalid for the first half`, () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(16, 0, 23, 59, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(0, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(16, 0, 23, 59, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(0, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const firstApptToDelete: Appointment = TestUtils.generateMockDateAppointment(14, 0, 23, 59, 0, 0);
      const apptToDelete: Appointment = TestUtils.generateMockDateAppointment(0, 0, 0, 55, 1, 1);

      expect(() => scheduler.deleteAppointment(apptToDelete, schedule, firstApptToDelete))
        .toThrow('Scheduler Error: Unable to delete appointment starting at 0/2/2020T14:0 and ending at 0/2/2020T23:59, occurs outside of schedule');
    });
  });

  describe('#deleteAppointments', () => {
    const scheduler: Scheduler = new Scheduler(5);
    const bStringUtil: BStringUtil = new BStringUtil(5);

    it(`should handle an appointment that doesn't cross the day boundary`, () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const apptToDelete: Appointment = TestUtils.generateMockDateAppointment(11, 0, 11, 55, 1, 1);
      const apptBStrings: string[] = bStringUtil.generateBStringFromAppointments([apptToDelete]) as string[];

      const dayOneExpectedBookings: Appointment = TestUtils.generateMockDateAppointment(12, 0, 17, 0, 1, 1);
      const expectedBookings: string = bStringUtil.generateBString(dayOneExpectedBookings) as string;

      const computedSchedule: Schedule = scheduler.deleteAppointments(apptBStrings, schedule) as Schedule;

      // Only needs to test that the bookings on the appropriate day was correctly modified
      expect(computedSchedule.bookings[1]).toEqual(expectedBookings);
    });

    it(`should handle an appointment that does cross the day boundary`, () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 23, 59, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(0, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 23, 59, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(0, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const apptToDelete: Appointment = TestUtils.generateMockDateAppointment(23, 0, 0, 55, 0, 1);
      const apptBStrings: string[] = bStringUtil.generateBStringFromAppointments([apptToDelete]) as string[];

      const dayZeroExpectedBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 22, 55, 0, 0);
      const expectedDayZeroBookings: string = bStringUtil.generateBString(dayZeroExpectedBookings) as string;

      const dayOneExpectedBookings: Appointment = TestUtils.generateMockDateAppointment(1, 0, 17, 0, 1, 1);
      const expectedDayOneBookings: string = bStringUtil.generateBString(dayOneExpectedBookings) as string;

      const computedSchedule: Schedule = scheduler.deleteAppointments(apptBStrings, schedule) as Schedule;

      // Only needs to test that the bookings on the appropriate days were correctly modified
      expect(computedSchedule.bookings[0]).toEqual(expectedDayZeroBookings);
      expect(computedSchedule.bookings[1]).toEqual(expectedDayOneBookings);
    });

    it(`should return false if the deletion is invalid for one day`, () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const apptToDelete: Appointment = TestUtils.generateMockDateAppointment(9, 0, 11, 55, 1, 1);
      const apptBStrings: string[] = bStringUtil.generateBStringFromAppointments([apptToDelete]) as string[];

      expect(() => scheduler.deleteAppointments(apptBStrings, schedule))
        .toThrow('BSchedule Error: interval to delete occurs outside of schedule on day 1 of the week starting on 0/2/2020T0:1');
    });

    it(`should throw an error if the deletion is invalid for the first half`, () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(16, 0, 23, 59, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(0, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(16, 0, 23, 59, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(0, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const apptToDelete: Appointment = TestUtils.generateMockDateAppointment(14, 0, 0, 55, 0, 1);
      const apptBStrings: string[] = bStringUtil.generateBStringFromAppointments([apptToDelete]) as string[];

      expect(() => scheduler.deleteAppointments(apptBStrings, schedule))
        .toThrow('BSchedule Error: interval to delete occurs outside of schedule on day 0 of the week starting on 0/2/2020T0:1');
    });

    it(`should handle multiple appointments`, () => {
      const dayZeroSchedule: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneSchedule: Appointment = TestUtils.generateMockDateAppointment(9, 0, 17, 0, 1, 1);
      const scheduledAvailability: string[] = TestUtils.generateTimeSet(dayZeroSchedule, dayOneSchedule);

      const dayZeroBookings: Appointment = TestUtils.generateMockDateAppointment(8, 0, 18, 0, 0, 0);
      const dayOneBookings: Appointment = TestUtils.generateMockDateAppointment(11, 0, 17, 0, 1, 1);
      const bookings: string[] = TestUtils.generateTimeSet(dayZeroBookings, dayOneBookings);

      const schedule: Schedule = TestUtils.generateSchedule(scheduledAvailability, bookings);

      const apptToDelete: Appointment = TestUtils.generateMockDateAppointment(11, 0, 11, 55, 1, 1);
      const apptToDeleteTwo: Appointment = TestUtils.generateMockDateAppointment(16, 0, 17, 0, 1, 1);
      const apptBStrings: string[] = bStringUtil.generateBStringFromAppointments([apptToDelete, apptToDeleteTwo]) as string[];

      const dayOneExpectedBookings: Appointment = TestUtils.generateMockDateAppointment(12, 0, 15, 55, 1, 1);
      const expectedBookings: string = bStringUtil.generateBString(dayOneExpectedBookings) as string;

      const computedSchedule: Schedule = scheduler.deleteAppointments(apptBStrings, schedule) as Schedule;

      // Only needs to test that the bookings on the appropriate day was correctly modified
      expect(computedSchedule.bookings[1]).toEqual(expectedBookings);
    });
  });
});