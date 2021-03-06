# BTimeFactory

`BTimeFactory` is the other class that is available to end users.  It is exposed for users who desire to directly interact with the utilities provided.  As such `BTimeFactory` exposes several utility methods.

##  Instantiating

`BTimeFactory` only requires one argument in it's constructor, the time interval.  The time interval will affect the temporal resolution of the scheduler, ie if was set to 5 - the schedule's resolution is 5 minute intervals.

```typescript
  // If using the scheduler
  // Instantiates a new Scheduler with a time interval of 5 min.
  const bTimeFactory: BTimeFactory = new BTimeFactory(5); 
```

**NB**: Each schedule group, ie all appointments for a given person, should have the same time interval

## `#parseBString`

The `#parseBString` method converts a bString in to a number so that it may be operated on, eg '10' = 2.

```typescript
  // If using the scheduler
  // Instantiates a new Scheduler with a time interval of 5 min.
  const bTimeFactory: BTimeFactory = new BTimeFactory(5); 

  const convertedBString: number = bTimeFactory.parseBString(bString);
```

## `#generateBString`

The `#generateBString` method converts an appointment into its bString representation. If the appointment is invalid, it return false.

```typescript
  // If using the scheduler
  // Instantiates a new Scheduler with a time interval of 5 min.
  const bTimeFactory: BTimeFactory = new BTimeFactory(5); 

  const generatedBString: number | false = bTimeFactory.generateBString(appt);
```

## `#timeStringSplit`

The `#timeStringSplit` splits a bString into intervals dependent upon the time interval, each interval is one hour long.

```typescript
  // If using the scheduler
  // Instantiates a new Scheduler with a time interval of 5 min.
  const bTimeFactory: BTimeFactory = new BTimeFactory(5); 

  const splitBStriing: string[] = bTimeFactory.timeStringSplit(string);
```

## `#decimalToBString`

The `#decimalToBString` converts number into a bString representation with the given scheduling interval.

```typescript
  // If using the scheduler
  // Instantiates a new Scheduler with a time interval of 5 min.
  const bTimeFactory: BTimeFactory = new BTimeFactory(5); 

  const splitBStriing: string[] = bTimeFactory.decimalToBString(string);
```

## `#testViabilityAndCompute`

The `#testViabilityAndCompute` tests that two time intervals do not overlap, either returning the result of a bitwise OR function performed on the two numbers, or false if value returned from bitwise OR isn't equal to bitwise XOR.

```typescript
  // If using the scheduler
  // Instantiates a new Scheduler with a time interval of 5 min.
  const bTimeFactory: BTimeFactory = new BTimeFactory(5); 

  const computedValue: number | false = bTimeFactory.testViabilityAndCompute(bString1, bString2);
```

## `#deleteAppointment`

The `#deleteAppointment` tests removal a give time slot from a given time interval and if valid removes it from the scheduleInterval, else it returns the original scheduleInterval.

```typescript
  // If using the scheduler
  // Instantiates a new Scheduler with a time interval of 5 min.
  const bTimeFactory: BTimeFactory = new BTimeFactory(5); 

  const computedBString: string = bTimeFactory.deleteAppointment(appointmentToDelete, scheduleInterval);
```

## `#modifyScheduleAndBooking`

`#modifyScheduleAndBooking` tests that an timeSlot does not overlap with another
timeSlot, if it does not overlap, the timeSlot is added to the bookings, else
return false.  Additionally, this method checks that the timeslot is within
availabilities (test).

```typescript
  // If using the scheduler
  // Instantiates a new Scheduler with a time interval of 5 min.
  const bTimeFactory: BTimeFactory = new BTimeFactory(5); 

  const computedBString: string | false = bTimeFactory.modifyScheduleAndBooking(
    scheduleBStringToModify,
    scheduleBStringToTest,
    appt
  );
```

## `#convertScheduleToAppointmentSchedule`

`#convertScheduleToAppointmentSchedule` takes a schedule and availabilty converting
them into an array of appointments for each date

```typescript
  // If using the scheduler
  // Instantiates a new Scheduler with a time interval of 5 min.
  const bTimeFactory: BTimeFactory = new BTimeFactory(5); 

  const appointmentSchedule: AppointmentSchedule = bTimeFactory.convertScheduleToAppointmentSchedule(
    schedule,
    availability
  );
```

## Additional Information

Additional information for each method and class is available in the form of JSDocs.