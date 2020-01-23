## How to Use

1. run `npm i` to install all the required packages
1. run `npm t` to run all tests
1. run `npm run stryker` to run mutation tests


## Assumptions

1. Weeks start on Sunday (same as moment)
1. Times can be converted to UTC without crossing a day boundary && thus week boundary - though this is not too difficult to handle, particularly for just day boundaries
1. Using 2016 * 2 digits (as a string, once for the schedule, once for bookings) to store the time for the week is ok for 5 min intervals, note this adjusts as time interval size changes.  The efficiency is greater for denser schedules.
