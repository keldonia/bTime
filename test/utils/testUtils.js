const TestUtils = {

  generateMockMoment: (hour, minute) => {
    return ({
      hour: () => hour,
      minute: () => minute
    });
  },

  generateMockAppointment: (hour1, minute1, hour2, minute2) => {
    return ({
      apptStart: TestUtils.generateMockMoment(hour1, minute1),
      apptEnd: TestUtils.generateMockMoment(hour2, minute2)
    });
  }
};

module.exports = TestUtils;