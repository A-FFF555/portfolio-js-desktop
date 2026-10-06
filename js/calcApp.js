/**
 * 計算機
 */

export function initCalcApp() {

  const calcDisplay = document.querySelector("#calcDisplay");
  const numButtons = document.querySelectorAll(".num_btn");
  const opButtons = document.querySelectorAll(".op_btn");
  const btnCalcClear = document.querySelector("#btnCalcClear");
  const btnCalcEqual = document.querySelector("#btnCalcEqual");

  if (!calcDisplay || !btnCalcClear || !btnCalcEqual) return;

  let displayValue = "0";
  let firstOperand = null;
  let operator = null;
  let waitingForSecondOperand = false;

  numButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const num = button.textContent;
      if (waitingForSecondOperand) {
        displayValue = num;
        waitingForSecondOperand = false;
      } else {
        displayValue = displayValue === "0" ? num : displayValue + num;
      }
      calcDisplay.value = displayValue;
    });
  });

  opButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const nextOperator = button.textContent;
      const inputValue = parseFloat(displayValue);

      if (operator && !waitingForSecondOperand) {
        const result = calculate(firstOperand, inputValue, operator);
        displayValue = String(result);
        calcDisplay.value = displayValue;

        firstOperand = result;
      } else {
        firstOperand = inputValue;
      }

      waitingForSecondOperand = true;
      operator = nextOperator;
    });
  });

  btnCalcEqual.addEventListener("click", function () {
    if (!operator || waitingForSecondOperand) return;

    const inputValue = parseFloat(displayValue);
    const result = calculate(firstOperand, inputValue, operator);

    displayValue = String(result);
    calcDisplay.value = displayValue;

    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
  });

  btnCalcClear.addEventListener("click", function () {
    displayValue = "0";
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;
    calcDisplay.value = displayValue;
  });

  function calculate(first, second, op) {
    if (op === "＋") return first + second;
    if (op === "－") return first - second;
    if (op === "×") return first * second;
    if (op === "÷") return second !== 0 ? first / second : "Error";
    return second;
  }
}