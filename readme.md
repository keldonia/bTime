# bTime

**bTime** is a small lightweight library, with no dependencies, designed to help manage schedules using bit manipulation.  It is particularly suited to working with dense schedules with discreet time intervals, e.g. 5 minutes.

## Getting Started

### From Source

1. Download the github repository
1. run `npm i` to install all the required packages
1. run `npm build` to build **bTime** in the `/dist` folder

### Development and Testing

1. run `npm i` to install all the required packages
1. run `npm build` to build **bTime** in the `/dist` folder
1. run `npm t` to run all tests
1. run `npm run stryker` to run mutation tests

## Using bTime

**bTime** includes two primary classes, [Scheduler](./documentation/scheduler.md) and [BinaryTimeFactory](./documentation/binaryTimeFactory.md).  Scheduler instantiates its own `BinaryTimeFactory` when instantiated.  `BinaryTimeFactory` can also be instantiated separately if one desires to directly make use of the binary time utils;

```typescript
  // If using the scheduler
  // Instantiates a new Scheduler with a time interval of 5 min.
  const scheduler: Scheduler = new Scheduler(5); 

  // To get remaining availability
  const remainingAvailabiltiy: string[] = scheduler.getCurrentAvailability(schedule);

  // To update a schedule
  const updatedSchedule: Schedule | false = scheduler.updateSchedule(proposedSchedule, currentSchedule);

  // To process an appointment
  const processedSchedule: Schedule | false = scheduler.processAppointment(appointment, schedule, ScheduleActions.BOOKING_UPDATE);

  // To process an appointments
  const processedSchedule: Schedule | false = scheduler.processAppointments(appointments, schedule, ScheduleActions.BOOKING_UPDATE);

  // To convert a schedule to an appointment schedule
  const processedSchedule: AppointmentSchedule = scheduler.convertScheduleToAppointmentSchedule(schedule);

  // If using the factory directly
  // Instantiates a new BinaryTimeFactory with a time interval of 5 min.
  const binaryTimeFactory: BinaryTimeFactory = new BinaryTimeFactory(5);  
```

Further, information on these two classes can be found here:
* [Scheduler](./documentation/scheduler.md)
* [BinaryTimeFactory](./documentation/binaryTimeFactory.md)

## Coming Features

1. Add instructions on how to handle the case where appointment crosses the week barrier & add utility to detect such cases
1. Clean up JSDocs
1. Throw Exceptions for cleaning stack tracing & surround with catches
1. Bit Array mode (don't store as strings), optional parameter
1. Allow compressed storage mode
1. Add an example use case

## Assumptions

1. Weeks start on Sunday
1. Times are expected to be in UTC
1. Using 2016 * 2 digits (as a string, once for the schedule, once for bookings) to store the time for the week is ok for 5 min intervals, note this adjusts as time interval size changes.  The efficiency is greater for denser schedules.
