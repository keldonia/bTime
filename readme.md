## How to Use

1. run `npm i` to install all the required packages
1. run `npm t` to run all tests
1. run `npm run start` to start the server on port 8080

## The App

The app is a basic crud app with the following features:
* CRUD operations for doctors
* Ability to book an appointment with a doctor (a tuple of (doctor, location, time)) 
* Ability to get all appointments for a doctor
* Ability to cancel an appointment with a doctor

The primary purpose of the app is to expose an interface to interact with the binary scheduler.

## Assumptions

1. A doctor is available at any of their locations for any of their available times
1. A doctor can only have one appointment at a time
1. A doctor can travel instantaneously between locations
1. Weeks start on Sunday (same as moment)
1. Times can be converted to UTC without crossing a day boundary && thus week boundary - though this is not too difficult to handle, particularly for just day boundaries
1. Using 2016 * 2 digits (as a string, once for the schedule, once for bookings) to store the time for the week is ok for 5 min intervals, note this adjusts as time interval size changes.  The efficiency is greater for denser schedules.
1. Assumes that schedules are entered for each week.  However, we have a base schedule set to the beginning of 1980, ie. we use a week in 1980 to store our base schedule as we aren't scheduling things almost 40 years in the past
1. Assumes that payloads are valid
1. Assumes updates to base schedule will not impact already scheduled weeks