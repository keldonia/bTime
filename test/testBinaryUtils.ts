const TestUtils = require("./utils/testUtils.js");
const BinaryUtils = require("./../server/utils/binaryUtils.js");

let assert = require("assert");

describe("Binary Utils", () => {
  describe("#findBinaryPointer(), assumes 5 min interval", () => {
    let tests = [
      { args: [0, 0], expected: 0 },
      { args: [0, 5], expected: 1 },
      { args: [1, 0], expected: 12 },
      { args: [1, 1], expected: 12 },
      { args: [0, 47], expected: 9 },
      { args: [0, 5], expected: 1 },
      { args: [12, 0], expected: 144 },
      { args: [13, 31], expected: 162 },
      { args: [5, 25], expected: 65 },
      { args: [8, 15], expected: 99 },
      { args: [10, 42], expected: 128 },
      { args: [20, 7], expected: 241 },
      { args: [23, 59], expected: 288 },
      { args: [24, 0], expected: 288 },
      { args: [9, 0], expected: 108 },
      { args: [12, 0], expected: 144 }
    ];

    tests.forEach(test => {
      let hour = test.args[0];
      let minute = test.args[1];
      let expected = test.expected;

      let testName = "should return " +
        expected +
        " if hour = " +
        hour +
        " and minute = " +
        minute;

      it(testName, () => {
        let testMoment = TestUtils.generateMockMoment(hour, minute);

        assert.equal(BinaryUtils.findBinaryPointer(testMoment), expected);
      });
    });
  });

  describe("#generateBinaryString(), assumes 5 min interval", () => {
    let tests = [
      { args: [4, 12, 5, 5], expected: "000000000000000000000000000000000000000000000000001111111111100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [0, 12, 0, 24], expected: "001110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [1, 0, 1, 24], expected: "000000000000111110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [0, 20, 0, 40], expected: "000011110000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000" },
      { args: [4, 20, 1, 40], expected: false }
    ];

    tests.forEach(test => {
      let args = test.args;
      let testAppt = TestUtils.generateMockAppointment(
        args[0], args[1], args[2], args[3]
      );
      let expected = test.expected;
      let testName = "should properly construct binary representation of appointment";

      it(testName, () => {
        assert.equal(BinaryUtils.generateBinaryString(testAppt), expected);
      });
    });
  });
});