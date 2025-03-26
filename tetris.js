import {
  PLAYFIELD_COLUMNS,
  PLAYFIELD_ROWS,
  TETROMINO_NAMES,
  TETROMINOES,
  getRandomElement,
  rotateMatrix,
  LEVEL_SCORES,
} from "./utilities.js";

import { nextLevelSound, moveDownSound } from "./music.js";

export class Tetris {
  constructor() {
    this.playfield;
    this.tetromino;
    this.isGameOver = false;
    this.init();
    this.score = 0;
    this.currentTurn = 0;
    this.level = 1;
  }

  init() {
    this.generatePlayfield();
    this.generateTetromino();
  }

  generatePlayfield() {
    this.playfield = new Array(PLAYFIELD_ROWS)
      .fill()
      .map(() => new Array(PLAYFIELD_COLUMNS).fill(0));
  }

  generateTetromino() {
    const name = getRandomElement(TETROMINO_NAMES);
    const matrix = TETROMINOES[name];

    const column = PLAYFIELD_COLUMNS / 2 - Math.floor(matrix.length / 2);
    const row = -2;

    this.tetromino = {
      name,
      matrix,
      row,
      column,
      ghostColumn: column,
      ghostRow: row,
    };
    this.currentTurn += 1;

    this.calculateGhostPosition();
  }

  moveTetrominoDown() {
    moveDownSound();
    this.tetromino.row += 1;
    if (!this.isValid()) {
      this.tetromino.row -= 1;
      this.placeTetromino();
    }
  }

  moveTetrominoLeft() {
    this.tetromino.column -= 1;
    if (!this.isValid()) {
      this.tetromino.column += 1;
    } else {
      this.calculateGhostPosition();
    }
  }

  moveTetrominoRight() {
    this.tetromino.column += 1;
    if (!this.isValid()) {
      this.tetromino.column -= 1;
    } else {
      this.calculateGhostPosition();
    }
  }

  rotateTetromino() {
    const oldMatrix = this.tetromino.matrix;
    const rotatedMatrix = rotateMatrix(this.tetromino.matrix);
    this.tetromino.matrix = rotatedMatrix;
    if (!this.isValid()) {
      this.tetromino.matrix = oldMatrix;
    } else {
      this.calculateGhostPosition();
    }
  }

  dropTetrominoDown() {
    this.tetromino.row = this.tetromino.ghostRow;
    this.placeTetromino();
  }

  isValid() {
    const matrixSize = this.tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
      for (let column = 0; column < matrixSize; column++) {
        if (!this.tetromino.matrix[row][column]) continue;
        if (this.isOutsideOfGameBoard(row, column)) return false;
        if (this.isCollides(row, column)) return false;
      }
    }
    return true;
  }

  isOutsideOfGameBoard(row, column) {
    return (
      this.tetromino.column + column < 0 ||
      this.tetromino.column + column >= PLAYFIELD_COLUMNS ||
      this.tetromino.row + row >= this.playfield.length
    );
  }

  isCollides(row, column) {
    return this.playfield[this.tetromino.row + row]?.[
      this.tetromino.column + column
    ];
  }

  placeTetromino() {
    const matrixSize = this.tetromino.matrix.length;
    for (let row = 0; row < matrixSize; row++) {
      for (let column = 0; column < matrixSize; column++) {
        if (!this.tetromino.matrix[row][column]) continue;
        if (this.isOutsideOfTopBoard(row)) {
          this.isGameOver = true;
          return;
        }

        this.playfield[this.tetromino.row + row][
          this.tetromino.column + column
        ] = this.tetromino.name;
      }
    }

    this.processFilledRows();
    this.generateTetromino();
  }

  isOutsideOfTopBoard(row) {
    return this.tetromino.row + row < 0;
  }

  processFilledRows() {
    const filledLines = this.findFilledRows();
    this.removeFilledRows(filledLines);
  }

  findFilledRows() {
    const filledRows = [];
    for (let row = 0; row < PLAYFIELD_ROWS; row++) {
      if (this.playfield[row].every((cell) => Boolean(cell))) {
        filledRows.push(row);
      }
    }

    return filledRows;
  }

  removeFilledRows(filledRows) {
    filledRows.forEach((row) => {
      this.dropRowsAbove(row);
    });
  }

  increaseScore() {
    this.score += 1;
    document.getElementById("score_id").innerHTML = `Score: ${this.score}`;
  }

  increaseLevel(newLevel) {
    if (this.level < newLevel) {
      this.level = newLevel;
      nextLevelSound(newLevel);
      let levelNumOuter = document.getElementById("levelNumOuter");
      let levelNumInner = document.getElementById("levelNumInner");
      if (levelNumOuter) levelNumOuter.classList.add("levelNumOuterColor");
      if (levelNumInner) levelNumInner.classList.add("levelNumInnerColor");
      const tempLevel = this.level;
      setTimeout(() => {
        levelNumInner.textContent = "";
      }, 1000);
      setTimeout(function () {
        levelNumInner.textContent = `${tempLevel}`;
        setTimeout(function () {
          if (levelNumOuter)
            levelNumOuter.classList.remove("levelNumOuterColor");
          if (levelNumInner)
            levelNumInner.classList.remove("levelNumInnerColor");
        }, 1000);
      }, 2000);
    }
  }

  showLevel() {
    if (this.score >= LEVEL_SCORES[LEVEL_SCORES.length - 1]) {
      this.increaseLevel(10);
    } else if (
      this.score >= LEVEL_SCORES[7] &&
      this.score < LEVEL_SCORES[LEVEL_SCORES.length - 1]
    ) {
      this.increaseLevel(9);
    } else if (this.score >= LEVEL_SCORES[6] && this.score < LEVEL_SCORES[7]) {
      this.increaseLevel(8);
    } else if (this.score >= LEVEL_SCORES[5] && this.score < LEVEL_SCORES[6]) {
      this.increaseLevel(7);
    } else if (this.score >= LEVEL_SCORES[4] && this.score < LEVEL_SCORES[5]) {
      this.increaseLevel(6);
    } else if (this.score >= LEVEL_SCORES[3] && this.score < LEVEL_SCORES[4]) {
      this.increaseLevel(5);
    } else if (this.score >= LEVEL_SCORES[2] && this.score < LEVEL_SCORES[3]) {
      this.increaseLevel(4);
    } else if (this.score >= LEVEL_SCORES[1] && this.score < LEVEL_SCORES[2]) {
      this.increaseLevel(3);
    } else if (this.score > LEVEL_SCORES[0]) {
      this.increaseLevel(2);
    }

    // document.getElementById("levelNumInner").innerHTML = `${this.level}`;
  }

  dropRowsAbove(rowToDelete) {
    for (let row = rowToDelete; row > 0; row--) {
      this.playfield[row] = this.playfield[row - 1];
    }
    this.playfield[0] = new Array(PLAYFIELD_COLUMNS).fill(0);

    this.increaseScore();
    this.showLevel();
  }

  calculateGhostPosition() {
    const tetrominoRow = this.tetromino.row;
    this.tetromino.row++;
    while (this.isValid()) {
      this.tetromino.row++;
    }
    this.tetromino.ghostRow = this.tetromino.row - 1;
    this.tetromino.ghostColumn = this.tetromino.column;
    this.tetromino.row = tetrominoRow;
  }
}
