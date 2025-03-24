import { Tetris } from "./tetris.js";
import {
  PLAYFIELD_COLUMNS,
  PLAYFIELD_ROWS,
  convertPositionToIndex,
  SAD,
  LEVEL_SCORES,
  DROP_SPEED,
} from "./utilities.js";

import {
  startRoundSound,
  ohhSound,
  startTrack,
  stopTrack,
  changeTrack,
} from "./music.js";

let hammer;
let requestId;
let timeoutId;
let isStarted = false;
let tetris = new Tetris();
let timeoutIdRestart, startMusicTimeout;
let timeoutSec = DROP_SPEED[0];

const cells = document.querySelectorAll(".grid>div");

function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod|Windows Phone/i.test(
    navigator.userAgent
  );
}

window.onload = function () {
  if (isMobileDevice()) {
    document.getElementById(
      "btnsTips_container_id"
    ).innerHTML = `<div><span class="mobileSpan">&#8592</span> Swipe left</div>
          <div><span class="mobileSpan">&#8594</span> Swipe right</div>
          <div><span class="mobileSpan">&#8595 / Drop </span> Swipe down</div>
          <div><span class="mobileSpan mobileSpanPointer">&#9757</span> Rotate</div>
          </div>`;
  }
};

function setInitialState() {
  tetris.currentTurn = 0;
  document.getElementById("score_id").innerHTML = `Score: 0`;
  document.getElementById("level").innerHTML = `Level: 1`;
  isStarted = false;
  timeoutSec = DROP_SPEED[0];
  changeTrack(1);
}

function start() {
  console.log("isStarted", isStarted);

  if (isStarted) {
    let restart = confirm("Start a new game?");
    if (restart) {
      gameOver();

      document.getElementById("startButton").disabled = true;

      timeoutIdRestart = setTimeout(() => {
        setInitialState();
        document.getElementById("startButton").disabled = false;
        start();
      }, 3000);
    }
  } else {
    tetris = new Tetris();
    initKeydown();
    initTouch();

    moveDown();
    isStarted = true;
    startRoundSound();

    startMusicTimeout = setTimeout(() => startTrack(), 2000);
    document.getElementById("startButton").innerHTML = "Restart";
  }
}

function handleOrientationChange() {
  if (screen.orientation.type.includes("landscape")) {
    document.body.style.transform = "rotate(90deg)";
  } else {
    document.body.style.transform = "rotate(0deg)";
  }
}

document.getElementById("startButton").addEventListener("click", start);
window.addEventListener("orientationchange", handleOrientationChange);

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
  if (tetris.score >= LEVEL_SCORES[LEVEL_SCORES.length - 1]) {
    timeoutSec = DROP_SPEED[DROP_SPEED.length - 1];
  } else if (
    tetris.score >= LEVEL_SCORES[7] &&
    tetris.score < LEVEL_SCORES[LEVEL_SCORES.length - 1]
  ) {
    timeoutSec = DROP_SPEED[8];
  } else if (
    tetris.score >= LEVEL_SCORES[6] &&
    tetris.score < LEVEL_SCORES[7]
  ) {
    timeoutSec = DROP_SPEED[7];
  } else if (
    tetris.score >= LEVEL_SCORES[5] &&
    tetris.score < LEVEL_SCORES[6]
  ) {
    timeoutSec = DROP_SPEED[6];
  } else if (
    tetris.score >= LEVEL_SCORES[4] &&
    tetris.score < LEVEL_SCORES[5]
  ) {
    timeoutSec = DROP_SPEED[5];
  } else if (
    tetris.score >= LEVEL_SCORES[3] &&
    tetris.score < LEVEL_SCORES[4]
  ) {
    timeoutSec = DROP_SPEED[4];
  } else if (
    tetris.score >= LEVEL_SCORES[2] &&
    tetris.score < LEVEL_SCORES[3]
  ) {
    timeoutSec = DROP_SPEED[3];
  } else if (
    tetris.score >= LEVEL_SCORES[1] &&
    tetris.score < LEVEL_SCORES[2]
  ) {
    timeoutSec = DROP_SPEED[2];
  } else if (tetris.score > LEVEL_SCORES[0]) {
    timeoutSec = DROP_SPEED[1];
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
  alert;
  isStarted = false;
  stopLoop();
  gameOverAnimation();
  document.removeEventListener("keydown", onKeydown);
  hammer.off("panstart panleft panright pandown swipedown tap");
  document.getElementById("startButton").innerHTML = "Start";
  stopTrack();
  ohhSound();
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
