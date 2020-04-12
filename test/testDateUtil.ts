import * as TestUtils from './utils/testUtils';

import { DateUtil } from './../src/utils/dateUtil'
import { Appointment } from '../src/@types';

describe('dateUtil', () => {

  describe('constructor', () =>  {
    it('should return an instance of the class', () => {
      const dateUtil: DateUtil = DateUtil.getInstance();

      expect(dateUtil).toBeDefined();
    })

    it('should return the same instance of the class if called multiple times', () => {
      const testDateUtilInstance: DateUtil = 'testValue' as any as DateUtil;
      DateUtil['instance'] = testDateUtilInstance;

      expect(DateUtil.getInstance()).toEqual(testDateUtilInstance);
    })

    it('should return a new instance of the class if instance is undefined', () => {
      DateUtil['instance'] = undefined;

      expect(DateUtil['instance']).toBeUndefined();
      expect(DateUtil.getInstance()).toBeDefined();
    })
  });

  describe('#enforceUTC', () => {
    const dateUtil: DateUtil = DateUtil.getInstance();

    it('should properly convert times to utc', () => {
      const startTime: Date = new Date('2011-10-10T23:30:00Z');
      const endTime: Date =  new Date('2011-10-11T00:30:00Z')
      const apptToBook: Appointment = {
        startTime,
        endTime
      };
      const expectedAppt: Appointment = {
        startTime: new Date(Date.UTC(
          startTime.getUTCFullYear(), 
          startTime.getUTCMonth(), 
          startTime.getUTCDate(),
          startTime.getUTCHours(),
          startTime.getUTCMinutes()
        )),
        endTime: new Date(Date.UTC(
          endTime.getUTCFullYear(), 
          endTime.getUTCMonth(), 
          endTime.getUTCDate(),
          endTime.getUTCHours(),
          endTime.getUTCMinutes()
        ))
      };

      const computedUtcAppt: Appointment = dateUtil.enforceUTC(apptToBook);
      
      expect(computedUtcAppt).toMatchObject(expectedAppt);
    });
  });

  describe("#getFirstDayOfWeekFromDate", () => {
    const dateUtil: DateUtil = DateUtil.getInstance();
    const tests = [
      { input: new Date('2020-02-12T00:00:00Z'), expected: new Date('2020-02-09T00:00:00Z') },
      { input: new Date('2020-02-09T00:00:00Z'), expected: new Date('2020-02-09T00:00:00Z') },
      { input: new Date('2020-02-15T00:00:00Z'), expected: new Date('2020-02-09T00:00:00Z') },
      { input: new Date('2020-02-11T00:00:00Z'), expected: new Date('2020-02-09T00:00:00Z') },
      { input: new Date('2020-04-01T00:00:00Z'), expected: new Date('2020-03-29T00:00:00Z') },
      { input: new Date('2020-04-04T00:00:00Z'), expected: new Date('2020-03-29T00:00:00Z') },
      { input: new Date('2020-03-29T00:00:00Z'), expected: new Date('2020-03-29T00:00:00Z') },
      { input: new Date('2019-12-30T00:00:00Z'), expected: new Date('2019-12-29T00:00:00Z') },
      { input: new Date('2020-01-01T00:00:00Z'), expected: new Date('2019-12-29T00:00:00Z') },
      { input: new Date('2020-01-03T00:00:00Z'), expected: new Date('2019-12-29T00:00:00Z') }
    ];

    tests.forEach(test => {
      const testName: string = `Date of ${test.input.toUTCString()} should return a start week date of ${test.expected.toUTCString()}`;

      it(testName, () => {
        const computedStartOfWeek: Date = dateUtil.getFirstDayOfWeekFromDate(test.input);

        expect(computedStartOfWeek.valueOf()).toEqual(test.expected.valueOf());
      });
    });
  });

  describe('#getDatesFromFromStartDate', () => {
    const dateUtil: DateUtil = DateUtil.getInstance();

    it('should properly create a weeks worth of Dates from a schedule, contained within a month', () => {
      const startDate: Date = new Date('2020-02-09T00:00:00Z');
      const dayOne: Date = new Date('2020-02-10T00:00:00Z');
      const dayTwo: Date = new Date('2020-02-11T00:00:00Z');
      const dayThree: Date = new Date('2020-02-12T00:00:00Z');
      const dayFour: Date = new Date('2020-02-13T00:00:00Z');
      const dayFive: Date = new Date('2020-02-14T00:00:00Z');
      const daySix: Date = new Date('2020-02-15T00:00:00Z');

      const expectedWeek: Date[] = [
        startDate,
        dayOne,
        dayTwo,
        dayThree,
        dayFour,
        dayFive,
        daySix
      ];
      const computedWeek: Date[] = dateUtil.getDatesFromFromStartDate(startDate);

      expect(computedWeek).toEqual(expect.arrayContaining(expectedWeek));
      expect(computedWeek).toStrictEqual(expectedWeek);
    });

    it('should properly create a weeks worth of Dates from a schedule, that crosses a month boundary', () => {
      const startDate: Date = new Date('2020-03-29T00:00:00Z');
      const dayOne: Date = new Date('2020-03-30T00:00:00Z');
      const dayTwo: Date = new Date('2020-03-31T00:00:00Z');
      const dayThree: Date = new Date('2020-04-01T00:00:00Z');
      const dayFour: Date = new Date('2020-04-02T00:00:00Z');
      const dayFive: Date = new Date('2020-04-03T00:00:00Z');
      const daySix: Date = new Date('2020-04-04T00:00:00Z');

      const expectedWeek: Date[] = [
        startDate,
        dayOne,
        dayTwo,
        dayThree,
        dayFour,
        dayFive,
        daySix
      ];
      const computedWeek: Date[] = dateUtil.getDatesFromFromStartDate(startDate);

      expect(computedWeek).toEqual(expect.arrayContaining(expectedWeek));
      expect(computedWeek).toStrictEqual(expectedWeek);
    });

    it('should properly create a weeks worth of Dates from a schedule, that crosses a year boundary', () => {
      const startDate: Date = new Date('2019-12-29T00:00:00Z');
      const dayOne: Date = new Date('2019-12-30T00:00:00Z');
      const dayTwo: Date = new Date('2019-12-31T00:00:00Z');
      const dayThree: Date = new Date('2020-01-01T00:00:00Z');
      const dayFour: Date = new Date('2020-01-02T00:00:00Z');
      const dayFive: Date = new Date('2020-01-03T00:00:00Z');
      const daySix: Date = new Date('2020-01-04T00:00:00Z');

      const expectedWeek: Date[] = [
        startDate,
        dayOne,
        dayTwo,
        dayThree,
        dayFour,
        dayFive,
        daySix
      ];
      const computedWeek: Date[] = dateUtil.getDatesFromFromStartDate(startDate);

      expect(computedWeek).toEqual(expect.arrayContaining(expectedWeek));
      expect(computedWeek).toStrictEqual(expectedWeek);
    });
  });


  describe('#crosssesDayBoundaryDate', () => {
    const dateUtil: DateUtil = DateUtil.getInstance();

    it('returns false if an appointment does not cross the day boundary', () => {
      const appt: Appointment = TestUtils.generateSimpleDateAppointment(new Date('2011-10-10T10:48:00Z'));
      const crossesDayBoundary: boolean = dateUtil.crosssesDayBoundary(appt);
     
      expect(crossesDayBoundary).toBeFalsy();
    });

    it('returns true if an appointment does cross the day boundary', () => {
      const appt: Appointment = TestUtils.generateSimpleDateAppointment(new Date('2011-10-10T23:48:00Z'));
      const crossesDayBoundary: boolean = dateUtil.crosssesDayBoundary(appt);

      expect(crossesDayBoundary).toBeTruthy();
    });
  });

  describe('#crosssesWeekBoundary', () => {
    const dateUtil: DateUtil = DateUtil.getInstance();
    const tests: Array<{ dateOne: Date, dateTwo: Date, expected: boolean }> = [
      { dateOne: new Date('1969-12-21T00:00:00Z'), dateTwo: new Date('1969-12-21T00:00:00Z'), expected: false },
      { dateOne: new Date('1969-12-21T00:00:00Z'), dateTwo: new Date('1969-12-26T00:00:00Z'), expected: false },
      { dateOne: new Date('1969-12-21T00:00:00Z'), dateTwo: new Date('1969-12-28T00:00:00Z'), expected: true },
      { dateOne: new Date('1969-12-28T00:00:00Z'), dateTwo: new Date('1970-01-02T00:00:00Z'), expected: false },
      { dateOne: new Date('2020-02-05T00:00:00Z'), dateTwo: new Date('2020-02-08T00:00:00Z'), expected: false },
      { dateOne: new Date('2020-02-08T00:00:00Z'), dateTwo: new Date('2020-03-08T00:00:00Z'), expected: true },
      { dateOne: new Date('2020-03-10T00:00:00Z'), dateTwo: new Date('2020-03-13T00:00:00Z'), expected: false },
      { dateOne: new Date('2020-02-04T00:00:00Z'), dateTwo: new Date('2020-02-08T00:00:00Z'), expected: false },
      { dateOne: new Date('2020-02-05T00:00:00Z'), dateTwo: new Date('2020-02-08T00:00:00Z'), expected: false }
    ]

    tests.forEach(test => {
      const testName = `should return ${test.expected} when passed an appt starting at: ${test.dateOne} and ending at ${test.dateTwo}`;
      const appt: Appointment = {
        startTime: test.dateOne,
        endTime: test.dateTwo
      };

      it(testName, () => {
        const computed: boolean = dateUtil.crosssesWeekBoundary(appt);

        expect(computed).toEqual(test.expected);
      });
    });
  });

  describe('#getWeek', () => {
    const dateUtil: DateUtil = DateUtil.getInstance();
    const tests: Array<{ input: Date, expected: number }> = [
      { input: new Date('1969-12-21T00:00:00Z'), expected: -1 },
      { input: new Date('1969-12-22T00:00:00Z'), expected: -1 },
      { input: new Date('1969-12-23T00:00:00Z'), expected: -1 },
      { input: new Date('1969-12-24T00:00:00Z'), expected: -1 },
      { input: new Date('1969-12-25T00:00:00Z'), expected: -1 },
      { input: new Date('1969-12-26T00:00:00Z'), expected: -1 },
      { input: new Date('1969-12-27T00:00:00Z'), expected: -1 },
      { input: new Date('1969-12-28T00:00:00Z'), expected: 0 },
      { input: new Date('1969-12-29T00:00:00Z'), expected: 0 },
      { input: new Date('1969-12-30T00:00:00Z'), expected: 0 },
      { input: new Date('1969-12-31T00:00:00Z'), expected: 0 },
      { input: new Date('1970-01-01T00:00:00Z'), expected: 0 },
      { input: new Date('1970-01-02T00:00:00Z'), expected: 0 },
      { input: new Date('1970-01-03T00:00:00Z'), expected: 0 },
      { input: new Date('1970-01-04T00:00:00Z'), expected: 1 },
      { input: new Date('1970-01-05T00:00:00Z'), expected: 1 },
      { input: new Date('1970-01-06T00:00:00Z'), expected: 1 },
      { input: new Date('1970-01-07T00:00:00Z'), expected: 1 },
      { input: new Date('1970-01-08T00:00:00Z'), expected: 1 },
      { input: new Date('1970-01-09T00:00:00Z'), expected: 1 },
      { input: new Date('1970-01-10T00:00:00Z'), expected: 1 },
      { input: new Date('2020-02-02T00:00:00Z'), expected: 2614 },
      { input: new Date('2020-02-03T00:00:00Z'), expected: 2614 },
      { input: new Date('2020-02-04T00:00:00Z'), expected: 2614 },
      { input: new Date('2020-02-05T00:00:00Z'), expected: 2614 },
      { input: new Date('2020-02-06T00:00:00Z'), expected: 2614 },
      { input: new Date('2020-02-07T00:00:00Z'), expected: 2614 },
      { input: new Date('2020-02-08T00:00:00Z'), expected: 2614 },
      { input: new Date('2020-03-08T00:00:00Z'), expected: 2619 },
      { input: new Date('2020-03-09T00:00:00Z'), expected: 2619 },
      { input: new Date('2020-03-10T00:00:00Z'), expected: 2619 },
      { input: new Date('2020-03-11T00:00:00Z'), expected: 2619 },
      { input: new Date('2020-03-12T00:00:00Z'), expected: 2619 },
      { input: new Date('2020-03-13T00:00:00Z'), expected: 2619 },
      { input: new Date('2020-03-14T00:00:00Z'), expected: 2619 },
    ];

    tests.forEach(test => {
      
      const testName: string = `should return ${test.expected}, when passed ${test.input}`;

      it(testName, () => {
        const computedWeek: number = dateUtil.getWeek(test.input);

        expect(computedWeek).toEqual(test.expected);
      });
    });
  });

  describe('#getUtcDateStart', () => {
    const dateUtil: DateUtil = DateUtil.getInstance();

    it('should return the expected utc start of the day', () => {
      const initialDate: Date = new Date('1969-12-21T12:00:00Z');
      const expectedDate: Date = new Date('1969-12-21T00:00:00Z');

      const calculatedDate: Date = dateUtil.getUtcDateStart(initialDate);
      
      expect(calculatedDate).toEqual(expectedDate);
    });
  })

  describe('#getUtcDateEnd', () => {
    const dateUtil: DateUtil = DateUtil.getInstance();

    it('should return the expected utc end of the day', () => {
      const initialDate: Date = new Date('1969-12-21T12:00:00Z');
      const expectedDate: Date = new Date('1969-12-21T23:59:00Z');

      const calculatedDate: Date = dateUtil.getUtcDateEnd(initialDate);
      
      expect(calculatedDate).toEqual(expectedDate);
    });

    it('should return the expected utc end of the day, with seconds', () => {
      const initialDate: Date = new Date('1969-12-21T12:00:00Z');
      const expectedDate: Date = new Date('1969-12-21T23:59:59Z');

      const calculatedDate: Date = dateUtil.getUtcDateEnd(initialDate, 59);
      
      expect(calculatedDate).toEqual(expectedDate);
    });
  })
})