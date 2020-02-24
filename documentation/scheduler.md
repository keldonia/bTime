# Scheduler

`Scheduler` represents the primary class that most users of **bTime** will use, thus the primary interface users interact.  As such it is entirely self-contained from the user perspective.  The primary methods of interaction with the class are the methods: `#updateSchedule` and `#processAppointment`;

##  Instantiating

`Scheduler` only requires one argument in it's constructor, the time interval.  The time interval will affect the temporal resolution of the scheduler, ie if was set to 5 - the schedule's resolution is 5 minute intervals.

```typescript
  // If using the scheduler
  // Instantiates a new Scheduler with a time interval of 5 min.
  const scheduler: Scheduler = new Scheduler(5); 
```

**NB**: Each schedule group, ie all appointments for a given person, should have the same time interval

## `#getCurrentAvailability`

The `#getCurrentAvailability` Takes a valid schedule and computes the remaining availability based on the total availability and current bookings, returns false if an invalid scehdule is passed.

```typescript
  // If using the scheduler
  // Instantiates a new Scheduler with a time interval of 5 min.
  const scheduler: Scheduler = new Scheduler(5); 

  // To get remaining availabiltiy in a schedule
  const remainingAvailability: Schedule | false = scheduler.getCurrentAvailability(schedule);
```

## `#updateSchedule`

The `#updateSchedule` method takes two arguments, the proposed schedule and the current schedule.  These schedules must adhere to the Schedule interface.  It will compare the proposed schedule against the bookings of the current schedule and will either return the updated schedule complete with the current bookings, in the case that current bookings work with the updated schedule or false if they do not.

```typescript
  // If using the scheduler
  // Instantiates a new Scheduler with a time interval of 5 min.
  const scheduler: Scheduler = new Scheduler(5); 

  // To update a schedule
  const updatedSchedule: Schedule | false = scheduler.updateSchedule(proposedSchedule, currentSchedule);
```

## `#processAppointment`

The `#processAppointment` method takes three agruments, the proposed appointment, the schedule, and the type of action \- a booking update or appointment delete.  The method will then check if there is availability for the proposed appointment in the schedule in the case of a booking update, returning with the updated schedule if the appointment is compatible with the schedule, or false if not.  If the an appointment is to be deleted the time interval of the appointment is freed.

```typescript
  // If using the scheduler
  // Instantiates a new Scheduler with a time interval of 5 min.
  const scheduler: Scheduler = new Scheduler(5); 

  // To process an appointment
  const processedSchedule: Schedule | false = scheduler.processAppointment(appointment, schedule, ScheduleActions.BOOKING_UPDATE); 
```

## `#convertScheduleToAppointmentSchedule`

`#convertScheduleToAppointmentSchedule` takes a schedule and converts it into an array of appointments for each date

```typescript
  // If using the scheduler
  // Instantiates a new Scheduler with a time interval of 5 min.
  const scheduler: Scheduler = new Scheduler(5); 

  const appointmentSchedule: AppointmentSchedule = scheduler.convertScheduleToAppointmentSchedule(
    schedule
  );
```

## Additional Information

Additional information for each method and class is available in the form of JSDocs.