import { defineStore } from 'pinia';
import { generateSudoku, isValid, solveSudoku } from '../services/sudokuService';

export const useSudokuStore = defineStore('sudoku', {
  state: () => ({
    sudokuGrid: [],
    initialGrid: [],
    solvedSudokuGrid: [],
    mistakeCount: 0,
    isLoaded: false,
    difficulty: 'normal',
    pencilMarks: Array(9).fill().map(() => Array(9).fill().map(() => [])),
    isGameCleared: false,
    isGameLocked: false,
    showClearOverlay: false,
  }),
  actions: {
    setSudokuGrid(grid) {
      this.sudokuGrid = grid;
    },
    setInitialGrid(grid) {
      this.initialGrid = grid;
    },
    setSolvedSudokuGrid(grid) {
      this.solvedSudokuGrid = grid;
    },
    updateCell({ row, col, number }) {
      this.sudokuGrid[row][col] = number;
    },
    incrementMistakeCount() {
      this.mistakeCount++;
    },
    setMistakeCount(count) {
      this.mistakeCount = count;
    },
    resetMistakeCount() {
      this.mistakeCount = 0;
    },
    setIsLoaded(value) {
      this.isLoaded = value;
    },
    setDifficulty(difficulty) {
      this.difficulty = difficulty;
    },
    setGameCleared(value) {
      this.isGameCleared = value;
      this.showClearOverlay = value;
      this.isGameLocked = value;
      this.saveGameState();
    },
    hideClearOverlay() {
      this.showClearOverlay = false;
      this.saveGameState();
    },
    hideClearModal() {
      this.isGameCleared = false;
      this.saveGameState();
    },
    async loadGameState() {
      const savedState = localStorage.getItem('sudokuGameState');
      if (savedState) {
        const gameState = JSON.parse(savedState);
        this.setSudokuGrid(gameState.sudokuGrid);
        this.setInitialGrid(gameState.initialGrid);
        this.setSolvedSudokuGrid(gameState.solvedSudokuGrid);
        this.setMistakeCount(gameState.mistakeCount);
        this.setDifficulty(gameState.difficulty);
        this.pencilMarks = gameState.pencilMarks || Array(9).fill().map(() => Array(9).fill().map(() => []));
        this.isGameCleared = gameState.isGameCleared || false;
        this.isGameLocked = gameState.isGameLocked || false;
        this.showClearOverlay = gameState.showClearOverlay || false;
      } else {
        await this.generateNewGame();
      }
      this.setIsLoaded(true);
    },
    async generateNewGame() {
      const { grid, solvedGrid } = generateSudoku(this.difficulty);
      this.setSudokuGrid(grid);
      this.setInitialGrid(JSON.parse(JSON.stringify(grid)));
      this.setSolvedSudokuGrid(solvedGrid);
      this.saveGameState();
    },
    saveGameState() {
      const gameState = {
        sudokuGrid: this.sudokuGrid,
        initialGrid: this.initialGrid,
        solvedSudokuGrid: this.solvedSudokuGrid,
        mistakeCount: this.mistakeCount,
        difficulty: this.difficulty,
        pencilMarks: this.pencilMarks,
        isGameCleared: this.isGameCleared,
        isGameLocked: this.isGameLocked,
        showClearOverlay: this.showClearOverlay,
      };
      localStorage.setItem('sudokuGameState', JSON.stringify(gameState));
    },
    async resetGame() {
      this.isGameCleared = false;
      this.isGameLocked = false;
      this.showClearOverlay = false;
      this.resetMistakeCount();
      this.resetPencilMarks();
      await this.generateNewGame();
      this.saveGameState();
      return {
        sudokuGrid: this.sudokuGrid,
        initialGrid: this.initialGrid,
        solvedSudokuGrid: this.solvedSudokuGrid
      };
    },
    async setDifficultyAction(difficulty) {
      this.setDifficulty(difficulty);
      this.isGameCleared = false;
      this.isGameLocked = false;
      this.showClearOverlay = false;
      this.resetMistakeCount();
      this.resetPencilMarks();
      await this.generateNewGame();
      this.saveGameState();
      return {
        sudokuGrid: this.sudokuGrid,
        initialGrid: this.initialGrid,
        solvedSudokuGrid: this.solvedSudokuGrid
      };
    },
    setPencilMark(row, col, number) {
      const index = this.pencilMarks[row][col].indexOf(number);
      if (index === -1) {
        this.pencilMarks[row][col].push(number);
      } else {
        this.pencilMarks[row][col].splice(index, 1);
      }
    },
    clearPencilMarks(row, col) {
      this.pencilMarks[row][col] = [];
    },
    resetPencilMarks() {
      this.pencilMarks = Array(9).fill().map(() => Array(9).fill().map(() => []));
    },
    checkGameClear() {
      const isCleared = this.sudokuGrid.every((row, rowIndex) =>
        row.every((cell, colIndex) => cell === this.solvedSudokuGrid[rowIndex][colIndex])
      );
      if (isCleared) {
        this.setGameCleared(true);
      }
      return isCleared;
    },
    updateCellAction({ row, col, number }) {
      if (this.isGameLocked) return;
      if (this.initialGrid[row][col] === 0) {
        const currentValue = this.sudokuGrid[row][col];
        const correctValue = this.solvedSudokuGrid[row][col];

        this.updateCell({ row, col, number });

        if (number !== 0 && number !== currentValue) {
          if (number !== correctValue) {
            this.incrementMistakeCount();
          }
        }

        this.saveGameState();
        this.checkGameClear();
      }
    },
    setGameLocked(value) {
      this.isGameLocked = value;
      this.saveGameState();
    },
  },
});