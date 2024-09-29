import { defineStore } from 'pinia';

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
            // showClearOverlay は変更しない
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
                await this.generateSudoku();
                this.resetPencilMarks();
            }
            this.setIsLoaded(true);
        },
        async generateSudoku() {
            const { grid, solvedGrid } = generateSudoku(this.difficulty);
            this.setSudokuGrid(grid);
            this.setInitialGrid(JSON.parse(JSON.stringify(grid)));
            this.setSolvedSudokuGrid(solvedGrid);
            this.saveGameState();

            return {
                sudokuGrid: grid,
                initialGrid: JSON.parse(JSON.stringify(grid)),
                solvedSudokuGrid: solvedGrid
            };
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
            return this.generateSudoku();
        },
        async setDifficultyAction(difficulty) {
            this.setDifficulty(difficulty);
            this.isGameLocked = false;
            this.resetMistakeCount();
            this.resetPencilMarks();
            return this.generateSudoku();
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
                this.setGameLocked(true);
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

// Helper functions
function generateSudoku(difficulty) {
    const grid = createEmptyGrid();
    if (fillGrid(grid)) {
        const solvedGrid = JSON.parse(JSON.stringify(grid));
        removeNumbers(grid, difficulty);
        return { grid, solvedGrid };
    }
    return null;
}

function createEmptyGrid() {
    return Array(9).fill().map(() => Array(9).fill(0));
}

function fillGrid(grid) {
    const emptyCell = findEmptyCell(grid);
    if (!emptyCell) return true;

    const [row, col] = emptyCell;
    const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (const num of numbers) {
        if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (fillGrid(grid)) return true;
            grid[row][col] = 0;
        }
    }

    return false;
}

function removeNumbers(grid, difficulty) {
    const cellsToRemove = shuffleArray([...Array(81).keys()]);
    const difficultySettings = {
        easy: { totalRemove: 35, maxPerColumn: 5 },
        normal: { totalRemove: 45, maxPerColumn: 6 },
        hard: { totalRemove: 60, maxPerColumn: 9 },
    };

    const setting = difficultySettings[difficulty];
    let removedCount = 0;
    const columnCounts = Array(9).fill(0);

    for (const cellIndex of cellsToRemove) {
        if (removedCount >= setting.totalRemove) break;

        const row = Math.floor(cellIndex / 9);
        const col = cellIndex % 9;

        if (columnCounts[col] < setting.maxPerColumn) {
            const symmetricRow = 8 - row;
            const symmetricCol = 8 - col;

            if (difficulty === 'hard' || grid[symmetricRow][symmetricCol] !== 0) {
                const temp = grid[row][col];
                grid[row][col] = 0;

                if (hasUniqueSolution(grid)) {
                    removedCount++;
                    columnCounts[col]++;
                    if (difficulty !== 'hard') {
                        grid[symmetricRow][symmetricCol] = 0;
                        removedCount++;
                        columnCounts[symmetricCol]++;
                    }
                } else {
                    grid[row][col] = temp;
                }
            }
        }
    }
}

function hasUniqueSolution(grid) {
    const solutions = [];
    solveSudoku(grid, solutions, 2);
    return solutions.length === 1;
}

function solveSudoku(grid, solutions, limit) {
    if (solutions.length >= limit) return;

    const emptyCell = findEmptyCell(grid);
    if (!emptyCell) {
        solutions.push(JSON.parse(JSON.stringify(grid)));
        return;
    }

    const [row, col] = emptyCell;
    for (let num = 1; num <= 9; num++) {
        if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            solveSudoku(grid, solutions, limit);
            grid[row][col] = 0;
        }
    }
}

function findEmptyCell(grid) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                return [row, col];
            }
        }
    }
    return null;
}

function isValid(grid, row, col, num) {
    // Row check
    if (grid[row].includes(num)) return false;

    // Column check
    if (grid.some(r => r[col] === num)) return false;

    // 3x3 box check
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[boxRow + i][boxCol + j] === num) return false;
        }
    }

    return true;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}