# How Tos


## Edge Cases

### Appointment Crosses the Week Boundary

As you might already know, bTime already handles when the case when an appointment
crosses a day boundary; it does not however handle the case where the appointment
crosses a week boundary.  The decision to not handle this case was made, better
enable customization of the schedule interface.  However, the Scheduler class does
provide some utilities to make handling this case.

That an appointment crosses the week boundary can be checked using the `crosssesWeekBoundary`
method on the Scheduler class.  This will return `true` if the appointment crosses the week
boundary and will return `false` otherwise.  If `true` is returned, the `composeAppointments`
method on the Scheduler class can be used to split the appointment across the day/week boundary.
These two appointments could then be processed normally. An example of how to handle this case
can be seen below:

```typescript
  // Assume that Scheduler is already instantiated

  // To check the week boundary was crossed
  const weekBoundaryCrossed: boolean = schedule.crosssesWeekBoundary(appointment);

  if (weekBoundaryCrossed) {
    const splitAppointments: AppointmentDuo = scheduler.composeAppointments(appointment);

    // Handle week one
    const weekOneProcessedSchedule: Schedule = scheduler.processAppointment(
      splitAppointments.initialAppointment,
      weekOneSchedule,
      ScheduleActions.BOOKING_UPDATE
    );
    // Handle week two
    const weekTwoProcessedSchedule: Schedule = scheduler.processAppointment(
      splitAppointments.secondAppointment,
      weekTwoSchedule,
      ScheduleActions.BOOKING_UPDATE
    );
  } else {
    // In this example we are booking a new appointment in a known schedule
    const processedSchedule: Schedule = scheduler.processAppointment(
      appointment,
      schedule,
      ScheduleActions.BOOKING_UPDATE
    );
  }

  // Insert code for handling processed schedules as needed
```