const TestUtils = require("./utils/testUtils.js");
const ScheduleBinaryUtils = require("./../server/utils/scheduleBinaryUtils.js");
const BinaryUtils = require("./../server/utils/binaryUtils.js");

let assert = require("assert");

describe("Schedule Binary Utils", () => {
  describe("#mergeScheduleBStringWithTest()", () => {
    let tests = [
      { args: [ "000011110000", "000000000011" ], expected: "000011110011" },
      { args: [ "000000000000", "000000000011" ], expected: "000000000011" },
      { args: [ "000011110000", "000000000000" ], expected: "000011110000" },
      { args: [ "011000000000", "000000011000" ], expected: "011000011000" },
      { args: [ "100000000000", "000000011111" ], expected: "100000011111" },
      { args: [ "011110000000", "000011110000" ], expected: false },
      { args: [ "110000000000", "111100000000" ], expected: false },
      { args: [ "000000000111", "000000111110" ], expected: false }
    ];

    tests.forEach(test => {
      let appt1 = test.args[0];
      let appt2 = test.args[1];
      let expected = test.expected;
      let testName = "should expect binary appts of " +
        appt1 +
        " & " +
        appt2 +
        " to return " +
        expected;

      it(testName, () => {
        assert.equal(
          ScheduleBinaryUtils.mergeScheduleBStringWithTest(appt1, appt2),
          expected
        );
      });
    });
  });

  // Tests the loop over #mergeScheduleBStringWithTest() works appropriately
  describe("#mergeScheduleBStringsWithTest()", () => {
    let tests = [
      { args: [1, 0, 1, 24, 0, 12, 0, 24], expected: "001110000000111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [1, 0, 1, 24, 4, 12, 5, 24], expected: "000000000000111110000000000000000000000000000000001111111111111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [0, 20, 0, 40, 0, 12, 0, 24], expected: false },
      { args: [12, 20, 13, 40, 13, 12, 15, 24], expected: false }
    ];

    tests.forEach(test => {
      let args = test.args;
      let appt1 = TestUtils.generateMockAppointment(
        args[0], args[1], args[2], args[3]
      );
      let appt2 = TestUtils.generateMockAppointment(
        args[4], args[5], args[6], args[7]
      );
      let appt2Str = BinaryUtils.generateBinaryString(appt2);
      let expected = test.expected;
      let testName = !!expected ?
        "should return schedule binary if appointments do not overlap" :
        "should return boolean false if appointments do overlap";


      it(testName, () => {
        assert.equal(
          ScheduleBinaryUtils.mergeScheduleBStringsWithTest(appt1, appt2Str),
          expected
        );
      });
    });
  });

  describe("#modifyScheduleAndBookingInterval()", () => {
    let tests = [
      { args: [ "000011110000", "000011111111", "000000000011" ], expected: "000011110011" },
      { args: [ "000000000000", "000000000000", "000000000011" ], expected: false },
      { args: [ "000011110000", "000011110000", "000000000000" ], expected: "000011110000" },
      { args: [ "011000000000", "000000000000", "000000011000" ], expected: false },
      { args: [ "100000000000", "111111111111", "000000011111" ], expected: "100000011111" },
      { args: [ "011110000000", "011110011111", "000000011111" ], expected: "011110011111" },
      { args: [ "011110000000", "000000000000", "000011110000" ], expected: false },
      { args: [ "110000000000", "000000000000", "111100000000" ], expected: false },
      { args: [ "000000000111", "000000000000", "000000111110" ], expected: false }
    ];

    tests.forEach(test => {
      let base = test.args[0];
      let testString = test.args[1];
      let appt = test.args[2];
      let expected = test.expected;
      let testName = "should expect binary base of " +
        base +
        " and test of " +
        testString +
        " with a change of " +
        appt +
        " to return " +
        expected;

      it(testName, () => {
        assert.equal(
          ScheduleBinaryUtils.modifyScheduleAndBookingInterval(base, testString, appt),
          expected
        );
      });
    });
  });

  describe("#deleteAppointmentInterval()", () => {
    let tests = [
      { args: [ "000011110011", "000000000011" ], expected: "000011110000" },
      { args: [ "000000000000", "000000000011" ], expected: "000000000011" },
      { args: [ "000011110000", "000000000000" ], expected: "000011110000" },
      { args: [ "011000011000", "000000011000" ], expected: "011000000000" },
      { args: [ "100000011111", "000000011111" ], expected: "100000000000" },
      { args: [ "011110000000", "000110000000" ], expected: "011000000000" },
      { args: [ "111100000000", "110000000000" ], expected: "001100000000" },
      { args: [ "000000111110", "000000000110" ], expected: "000000111000" }
    ];

    tests.forEach(test => {
      let base = test.args[0];
      let appt = test.args[1];
      let expected = test.expected;
      let testName = "should expect binary base of " +
        base +
        " and deleted appt of " +
        appt +
        " to return " +
        expected;

      it(testName, () => {
        assert.equal(
          ScheduleBinaryUtils.deleteAppointmentInterval(base, appt),
          expected
        );
      });
    });
  });
});