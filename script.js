import { Tetris } from "./tetris.js";
import {
  PLAYFIELD_COLUMNS,
  PLAYFIELD_ROWS,
  convertPositionToIndex,
  SAD,
} from "./utilities.js";

let hammer;
let requestId;
let timeoutId;
let isStarted = false;
let tetris = new Tetris();

const dropSpeed = [1200, 1000, 800, 600, 550, 500, 450, 400, 350, 300];
const scoreLimit = [5, 10, 15, 25, 45, 65, 85, 125, 185];
let timeoutSec = dropSpeed[0];

const cells = document.querySelectorAll(".grid>div");

function start() {
  // alert("Start Button clicked!");
  initKeydown();
  initTouch();

  moveDown();
  if (tetris.currentTurn > 0) isStarted = true;
  document.getElementById("startButton").innerHTML = "Restart";

  if (isStarted) {
    let restart = confirm("Start a new game?");
    if (restart) {
      tetris.currentTurn = 0;
      isStarted = false;
      gameOver();
      timeoutIdRestart = setTimeout(() => {
        tetris = new Tetris();
        timeoutSec = initTimeoutSec;
        start();
      }, 3000);
    }
  }
}

document.getElementById("startButton").addEventListener("click", start);

function initKeydown() {
  document.addEventListener("keydown", onKeydown);
}

function onKeydown(event) {
  switch (event.key) {
    case "ArrowUp":
      rotate();
      break;
    case "ArrowDown":
      moveDown();
      break;
    case "ArrowLeft":
      moveLeft();
      break;
    case "ArrowRight":
      moveRight();
      break;
    case "Control":
      if (event.code === "ControlLeft") dropDown();
      break;
    default:
      return;
  }
}

function initTouch() {
  document.addEventListener("dblclick", (event) => {
    event.preventDefault();
  });

  hammer = new Hammer(document.querySelector("body"));
  hammer.get("pan").set({ direction: Hammer.DIRECTION_ALL });
  hammer.get("swipe").set({ direction: Hammer.DIRECTION_ALL });

  const threshold = 30;
  let deltaX = 0;
  let deltaY = 0;

  hammer.on("panstart", () => {
    deltaX = 0;
    deltaY = 0;
  });

  hammer.on("panleft", (event) => {
    if (Math.abs(event.deltaX - deltaX) > threshold) {
      moveLeft();
      deltaX = event.deltaX;
      deltaY = event.deltaY;
    }
  });

  hammer.on("panright", (event) => {
    if (Math.abs(event.deltaX - deltaX) > threshold) {
      moveRight();
      deltaX = event.deltaX;
      deltaY = event.deltaY;
    }
  });

  hammer.on("pandown", (event) => {
    if (Math.abs(event.deltaY - deltaY) > threshold) {
      moveDown();
      deltaX = event.deltaX;
      deltaY = event.deltaY;
    }
  });

  hammer.on("swipedown", (event) => {
    dropDown();
  });

  hammer.on("tap", () => {
    rotate();
  });
}

function moveDown() {
  tetris.moveTetrominoDown();
  draw();
  stopLoop();
  startLoop();

  if (tetris.isGameOver) {
    gameOver();
  }
}

function moveLeft() {
  tetris.moveTetrominoLeft();
  draw();
}

function moveRight() {
  tetris.moveTetrominoRight();
  draw();
}

function rotate() {
  tetris.rotateTetromino();
  draw();
}

function dropDown() {
  tetris.dropTetrominoDown();
  draw();
  stopLoop();
  startLoop();

  if (tetris.isGameOver) {
    gameOver();
  }
}

function startLoop() {
  if (tetris.score >= scoreLimit[scoreLimit.length - 1]) {
    timeoutSec = dropSpeed[dropSpeed.length - 1];
  } else if (
    tetris.score >= scoreLimit[7] &&
    tetris.score < scoreLimit[scoreLimit.length - 1]
  ) {
    timeoutSec = dropSpeed[8];
  } else if (tetris.score >= scoreLimit[6] && tetris.score < scoreLimit[7]) {
    timeoutSec = dropSpeed[7];
  } else if (tetris.score >= scoreLimit[5] && tetris.score < scoreLimit[6]) {
    timeoutSec = dropSpeed[6];
  } else if (tetris.score >= scoreLimit[4] && tetris.score < scoreLimit[5]) {
    timeoutSec = dropSpeed[5];
  } else if (tetris.score >= scoreLimit[3] && tetris.score < scoreLimit[4]) {
    timeoutSec = dropSpeed[4];
  } else if (tetris.score >= scoreLimit[2] && tetris.score < scoreLimit[3]) {
    timeoutSec = dropSpeed[3];
  } else if (tetris.score >= scoreLimit[1] && tetris.score < scoreLimit[2]) {
    timeoutSec = dropSpeed[2];
  } else if (tetris.score > scoreLimit[0]) {
    timeoutSec = dropSpeed[1];
  }

  console.log("Drop speed:", timeoutSec);

  timeoutId = setTimeout(
    () => (requestId = requestAnimationFrame(moveDown)),
    timeoutSec
  );
}

function stopLoop() {
  cancelAnimationFrame(requestId);
  clearTimeout(timeoutId);
}

function draw() {
  cells.forEach((cell) => cell.removeAttribute("class"));
  drawPlayfield();
  drawTetromino();
  drawGhostTetromino();
}

function drawPlayfield() {
  for (let row = 0; row < PLAYFIELD_ROWS; row++) {
    for (let column = 0; column < PLAYFIELD_COLUMNS; column++) {
      if (!tetris.playfield[row][column]) continue;
      const name = tetris.playfield[row][column];
      const cellIndex = convertPositionToIndex(row, column);
      cells[cellIndex].classList.add(name);
    }
  }
}

function drawTetromino() {
  const name = tetris.tetromino.name;
  const tetrominoMatrixSize = tetris.tetromino.matrix.length;
  for (let row = 0; row < tetrominoMatrixSize; row++) {
    for (let column = 0; column < tetrominoMatrixSize; column++) {
      if (!tetris.tetromino.matrix[row][column]) continue;
      if (tetris.tetromino.row + row < 0) continue;
      const cellIndex = convertPositionToIndex(
        tetris.tetromino.row + row,
        tetris.tetromino.column + column
      );
      cells[cellIndex].classList.add(name);
    }
  }
}

function drawGhostTetromino() {
  const tetrominoMatrixSize = tetris.tetromino.matrix.length;
  for (let row = 0; row < tetrominoMatrixSize; row++) {
    for (let column = 0; column < tetrominoMatrixSize; column++) {
      if (!tetris.tetromino.matrix[row][column]) continue;
      if (tetris.tetromino.ghostRow + row < 0) continue;
      const cellIndex = convertPositionToIndex(
        tetris.tetromino.ghostRow + row,
        tetris.tetromino.ghostColumn + column
      );
      cells[cellIndex].classList.add("ghost");
    }
  }
}

function gameOver() {
  stopLoop();
  document.removeEventListener("keydown", onKeydown);
  hammer.off("panstart panleft panright pandown swipedown tap");
  gameOverAnimation();
  document.getElementById("startButton").innerHTML = "Start";
}

function gameOverAnimation() {
  const filledCells = [...cells].filter((cell) => cell.classList.length > 0);
  filledCells.forEach((cell, i) => {
    setTimeout(() => cell.classList.add("hide"), i * 10);
    setTimeout(() => cell.removeAttribute("class"), i * 10 + 500);
  });

  setTimeout(drawSad, filledCells.length * 10 + 1000);
}

function drawSad() {
  const TOP_OFFSET = 5;
  for (let row = 0; row < SAD.length; row++) {
    for (let column = 0; column < SAD[0].length; column++) {
      if (!SAD[row][column]) continue;
      const cellIndex = convertPositionToIndex(TOP_OFFSET + row, column);
      cells[cellIndex].classList.add("sad");
    }
  }
}
