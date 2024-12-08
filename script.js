// !DOM Elements
const screen = document.querySelector(".screen");
const onButton = document.querySelector(".btn.on");
const offButton = document.querySelector(".btn.off");
const buttons = document.querySelectorAll(".btn.action");
const audioButton = document.querySelector(".btn.audio");
const audio = new Audio("./store-scanner-beep-90395.mp3");

// !Variables
let firstExpression = "";        // Holds the first number
let secondExpression = "";       // Holds the second number (after operator)
let currentOperator = "";        // Stores the current operator (+, -, etc.)
let isOn = false;                // Calculator power state
let isAudioOn = true;            // Audio toggle
let memory = "";                 // Memory storage
const maxDigits = 11;            // Max digits allowed on screen

// !Event Listeners
onButton.addEventListener("click", () => {
  onCalculator();
  playAudio();
});

offButton.addEventListener("click", offCalculator);

audioButton.addEventListener("click", () => {
  toggleAudio();
  playAudio();
});

buttons.forEach((button) => {
  button.addEventListener("click", (event) => {
    handleInput(event);
    playAudio();
  });
});

// !Screen Update
function updateScreen(value) {
  screen.textContent = value || "0";
  console.log({ firstExpression, currentOperator, secondExpression });
}

// !Calculator Control
function onCalculator() {
  if (!isOn) {
    // Role of "ON"
    isOn = true;
    screen.classList.add("on");
  } else {
    // Role of "C"
    resetExpressions();
  }
  updateScreen(); // Always reset screen
}

function offCalculator() {
  if (!isOn) return;

  isOn = false;
  screen.classList.remove("on");
  resetExpressions();
  memory = "";
  isAudioOn = true;
  updateScreen();
}

function playAudio() {
  if (!isOn || !isAudioOn) return;

  audio.currentTime = 0;
  audio.play();

  // Stop audio after 0.3s to avoid long beep
  setTimeout(() => {
    audio.pause();
    audio.currentTime = 0;
  }, 300);
}

function toggleAudio() {
  if (isOn) isAudioOn = !isAudioOn;
}

// !Main Input Handler
function handleInput(event) {
  if (!isOn) return;

  const value = event.target.value;

  if (isNumberOrDot(value)) return handleNumberInput(value);
  if (isOperator(value)) return handleOperatorInput(value);
  if (value === "=") return handleEqual();
  if (value === "%") return handlePercentage();
  if (value === "sqrt") return handleSquareRoot();
  if (value === "mcr") return handleMemoryRecall();
  if (value === "m+") return handleMemoryAdd();
  if (value === "m-") return handleMemoryClear();
}

// !Input Handlers
function handleNumberInput(value) {
  const expr = currentOperator ? secondExpression : firstExpression;

  // Prevent too many digits
  if ((expr + value).length > (expr.includes(".") ? maxDigits + 1 : maxDigits)) return;
  // Prevent multiple dots
  if (value === "." && expr.includes(".")) return;
  // Prevent multiple leading zeros
  if (value === "0" && expr === "0") return;

  const updated = (value === "." && (expr === "" || expr === "0"))
    ? "0."
    : (expr === "0" ? value : expr + value);

  if (!currentOperator) {
    firstExpression = updated;
    updateScreen(firstExpression);
  } else {
    secondExpression = updated;
    updateScreen(secondExpression);
  }
}

function handleOperatorInput(value) {
  if (!firstExpression) return; // can't start with operator

  // If both expressions exist, calculate intermediate result
  if (currentOperator && secondExpression) {
    try {
      let result = eval(`${firstExpression}${currentOperator}${secondExpression}`);
      result = formatOutput(result.toString());
      if (!result) return showError();

      firstExpression = result;
      secondExpression = "";
    } catch (error) {
      return showError();
    }
  }

  currentOperator = value;
  // Keep showing the first number
  updateScreen(firstExpression);
}

function handleEqual() {
  if (!firstExpression || !currentOperator || !secondExpression) return;

  try {
    let result = eval(`${firstExpression}${currentOperator}${secondExpression}`);
    result = formatOutput(result.toString());
    if (!result) return showError();

    firstExpression = result;
    secondExpression = "";
    currentOperator = "";
    updateScreen(firstExpression);
  } catch (error) {
    return showError();
  }
}

function handlePercentage() {
  const expr = currentOperator ? secondExpression : firstExpression;
  if (!expr) return;

  const result = formatOutput((parseFloat(expr) / 100).toString());
  if (!result) return showError();

  (!currentOperator) ? firstExpression = result : secondExpression = result;

  updateScreen(result);
}

function handleSquareRoot() {
  const expr = currentOperator ? secondExpression : firstExpression;
  if (!expr) return;

  const result = formatOutput(Math.sqrt(parseFloat(expr)).toString());
  if (!result) return showError();

  (!currentOperator) ? firstExpression = result : secondExpression = result;

  updateScreen(result);
}

// ! Memory Functions
function handleMemoryRecall() {
  if (!memory) return;

  // Simulate pressing each digit
  const chars = memory.split("");
  for (const char of chars) {
    handleNumberInput(char);
  }

  console.log("Memory recalled:", memory);
}

function handleMemoryAdd() {
  const expr = !currentOperator ? firstExpression : secondExpression;
  if (!expr) return;

  memory = (parseFloat(memory || 0) + parseFloat(expr)).toString();
  console.log("Memory:", memory);
}

function handleMemoryClear() {
  if (!memory) return;
  memory = "";
  console.log("Memory cleared");
}

// !Helper Functions
function resetExpressions() {
  firstExpression = "";
  secondExpression = "";
  currentOperator = "";
}

function isNumberOrDot(value) {
  return (value >= "0" && value <= "9") || value === ".";
}

function isOperator(value) {
  return ["+", "-", "*", "/"].includes(value);
}

function formatOutput(value) {
  // Reject scientific notation, NaN (e.g., sqrt of -4), or Infinity (e.g., 5 / 0)
  if (typeof value !== "string" || value.includes("e") || isNaN(value) || !Number.isFinite(parseFloat(value))) {
    return false;
  }

  const maxChars = value?.includes(".") ? maxDigits + 1 : maxDigits;
  if (value.length <= maxChars) return value;

  // Adjust precision based on prefix
  const prefixLength = countPrefixLength(value);
  const precision = maxDigits - prefixLength;

  const rounded = parseFloat(value).toPrecision(precision);

  // Final check: if it's too long or has 'e', reject
  if (rounded.length > maxChars || rounded.includes("e")) return false;

  return rounded;
}

// count prefix length : -, 0., 0.00
function countPrefixLength(value) {
  let prefix = 0;

  if (value.startsWith('-')) {
    prefix++;
    value = value.slice(1);
  }

  if (value.startsWith('0.')) {
    prefix++;
    value = value.slice(2);

    while (value.startsWith('0')) {
      prefix++;
      value = value.slice(1);
    }
  }
  return prefix;
}

function showError() {
  resetExpressions();
  updateScreen("Error");
}
