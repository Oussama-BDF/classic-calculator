// ! DOM Elements
const screen = document.querySelector(".screen");
const buttons = document.querySelectorAll(".btn.action");
const onButton = document.querySelector(".btn.on");
const offButton = document.querySelector(".btn.off");
const audioBtn = document.querySelector(".btn.audio");
const audio = new Audio("./store-scanner-beep-90395.mp3");

let expression = "", isOn = false, isAudioOn = true, memory = 0;

// !Add Event Listeners
onButton.addEventListener("click", onCalculator);
offButton.addEventListener("click", offCalculator);
buttons.forEach((button) => button.addEventListener("click", playAudio));
onButton.addEventListener("click", playAudio);
audioBtn.addEventListener("click", switchAudio)
buttons.forEach((button) => button.addEventListener("click", handleInput));
audioBtn.addEventListener("click", playAudio);

// !Functions
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
    expression = "";
    updateScreen();
    isAudioOn = true;
    memory = 0;
    screen.classList.remove("on");
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

function switchAudio() {
  if (isOn){
    isAudioOn = !isAudioOn ;
  }
}

function handleInput(event) {
  if (!isOn) return; // Ignore input if the calculator is off

  const value = event.target.value; // Get the value of the clicked button(it can be 1, +, =, etc)

  if (isNumberOrDecimal(value)) {
    handleNumber(value);
  } else if (isOperator(value)) {
    handleOperator(value);
  } else if (value === "=" && expression) {
    if (!calculateResult()) return;
  } else if (value === "%") {
    calculatePercentage();
  } else if (value === "sqrt") {
      calculateSquareRoot();
  } else if (value === "mcr") {
      recallMemory();
  } else if (value === "m+") {
      fillMemory();
  } else if (value === "m-") {
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
  if (value === "0" && expression === "") return;
  if (value === "." && expression === ""){
    expression = "0.";
    return;
  }
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
  const maxDigits = (value?.toString().includes("."))? 15 : 14;
  screen.textContent = value?.toString().slice(0, maxDigits) || 0;
}

function recallMemory() {
  expression += memory.toString();
}

function fillMemory() {
  if(memory === 0)
    memory = parseFloat(expression);
  else
    memory += parseFloat(expression);
}

function clearMemory() {
  memory = 0;
}