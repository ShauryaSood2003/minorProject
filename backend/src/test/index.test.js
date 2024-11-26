import { sum } from "../sum";

/**
 * A suite of tests for the `sum` function, ensuring its behavior under multiple conditions.
 * The goal is to validate the correct addition of numbers and handle edge cases effectively.
 */
describe("Mathematical Operations - `sum` function", () => {
  /**
   * This test case verifies that the sum of two positive integers is calculated correctly.
   * This serves as a basic test for the addition functionality of the `sum` function.
   */
  it("should correctly add two positive integers and return the expected sum", () => {
    const number1 = 1;
    const number2 = 2;
    const expectedSum = 3;

    // Adding two positive integers
    expect(sum(number1, number2)).toBe(expectedSum);
  });

  /**
   * This test case ensures that the `sum` function returns the correct result when adding
   * a positive and a negative integer, which is a common operation.
   */
  it("should correctly add a positive and a negative integer", () => {
    const number1 = 5;
    const number2 = -3;
    const expectedSum = 2;

    // Adding a positive and negative integer
    expect(sum(number1, number2)).toBe(expectedSum);
  });

  /**
   * This test verifies that the sum function works correctly when adding two negative integers.
   * It ensures that the `sum` function handles negative values accurately.
   */
  it("should correctly add two negative integers", () => {
    const number1 = -4;
    const number2 = -6;
    const expectedSum = -10;

    // Adding two negative integers
    expect(sum(number1, number2)).toBe(expectedSum);
  });

  /**
   * This test case evaluates how the `sum` function handles the edge case of adding zero.
   * Adding zero to any number should return the number itself.
   */
  it("should correctly add zero to a number without altering the value", () => {
    const number1 = 0;
    const number2 = 42;
    const expectedSum = 42;

    // Adding zero to a number
    expect(sum(number1, number2)).toBe(expectedSum);
  });
});
