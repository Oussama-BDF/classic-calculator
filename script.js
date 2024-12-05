// ! DOM Elements
const screen = document.querySelector(".screen");
const buttons = document.querySelectorAll(".btn.action");
const onButton = document.querySelector(".btn.on");
const offButton = document.querySelector(".btn.off");
const audio = new Audio("./store-scanner-beep-90395.mp3");
const audioBtn = document.querySelector(".audio");

let expression = "", isOn = false, isAudioOn = true, memory = 0;

// !Add Event Listeners
buttons.forEach((button) => button.addEventListener("click", handleInput));
onButton.addEventListener("click", onCalculator);
offButton.addEventListener("click", offCalculator);
buttons.forEach((button) => button.addEventListener("click", playAudio));
onButton.addEventListener("click", playAudio);
audioBtn.addEventListener("click", () => { if (isOn) isAudioOn = !isAudioOn })
audioBtn.addEventListener("click", playAudio);

// !Functions
function handleInput(event) {
  if (!isOn) return; // Ignore input if the calculator is off

  const value = event.target.textContent; // Get the value of the clicked button(it can be 1, +, =, etc)

  if (isNumberOrDecimal(value)) {
    handleNumber(value);
  } else if (isOperator(value)) {
    handleOperator(value);
  } else if (value === "=" && expression) {
    if (!calculateResult()) return;
  } else if (value === "%") {
    calculatePercentage();
  } else if (value === "√") {
      calculateSquareRoot();
  } else if (value === "MRC") {
      recallMemory();
  } else if (value === "M+") {
      fillMemory();
  } else if (value === "M-") {
      clearMemory();
  }

  updateScreen(expression); // In all the cases we need to display a result on the screen
}

function isNumberOrDecimal(value) {
  // If the value is a number or "."
  return (value >= "0" && value <= "9") || value === ".";
}

function handleNumber(value) {
  if (value === "." && expression.endsWith(".")) return; // Ignore input if the value is ".", and the exp already ends with "."
  expression += value;
}

function isOperator(value) {
  return ["+", "-", "*", "/"].includes(value);
}

function handleOperator(operator) {
  if (!expression) return; // Ignore operator if no expression exists
  if (isOperator(expression.slice(-1))) {
    // Replace the last operator if already present
    expression = expression.slice(0, -1);
  }
  expression += operator;
}

function calculateResult() {
  try {
    expression = eval(expression).toString(); // Evaluate the expression
    return true;
  } catch {
    expression = ""; // Reset on error
    updateScreen("Error");
    return false;
  }
}

function calculatePercentage() {
  if (!expression) return; // Ignore if no expression exists
  expression = (parseFloat(expression) / 100).toString();
}

function calculateSquareRoot() {
  if (!expression) return; // Ignore if no expression exists
  expression = Math.sqrt(parseFloat(expression)).toString();
}

function updateScreen(value) {
  screen.textContent = value || 0;
}

function recallMemory() {
  expression += memory.toString();
}

function fillMemory() {
  memory = parseFloat(expression);
}

function clearMemory() {
  memory = 0;
}

function onCalculator() {
  if (!isOn) {
    // Role of "ON"
    isOn = true;
    screen.classList.add("on");
  } else {
    // Role of "C"
    expression = "";
  }
  updateScreen(); // in all the cases the screen must contains 0
}

function offCalculator() {
  if (isOn) {
    isOn = false;
    screen.classList.remove("on");
    expression = "";
    updateScreen();
  }
}

function playAudio() {
  if (isOn && isAudioOn) {
    audio.currentTime = 0;
    audio.play();
    // Stop the audio after 0.3 seconds (300 milliseconds)
    setTimeout(() => {
      audio.pause();
      audio.currentTime = 0;
    }, 300);
  }
}