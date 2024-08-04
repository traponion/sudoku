import { createStore } from 'vuex';

export default createStore({
    state: {
        sudokuGrid: [],
        initialGrid: [],
        solvedSudokuGrid: [],
        mistakeCount: 0,
        isLoaded: false,
        difficulty: 'normal',
    },
    mutations: {
        setSudokuGrid(state, grid) {
            state.sudokuGrid = grid;
        },
        setInitialGrid(state, grid) {
            state.initialGrid = grid;
        },
        setSolvedSudokuGrid(state, grid) {
            state.solvedSudokuGrid = grid;
        },
        updateCell(state, { row, col, number }) {
            state.sudokuGrid[row][col] = number;
        },
        incrementMistakeCount(state) {
            state.mistakeCount++;
        },
        setMistakeCount(state, count) {
            state.mistakeCount = count;
        },
        resetMistakeCount(state) {
            state.mistakeCount = 0;
        },
        setIsLoaded(state, value) {
            state.isLoaded = value;
        },
        setDifficulty(state, difficulty) {
            state.difficulty = difficulty;
        },
    },
    actions: {
        async loadGameState({ commit, dispatch }) {
            const savedState = localStorage.getItem('sudokuGameState');
            if (savedState) {
                const gameState = JSON.parse(savedState);
                commit('setSudokuGrid', gameState.sudokuGrid);
                commit('setInitialGrid', gameState.initialGrid);
                commit('setSolvedSudokuGrid', gameState.solvedSudokuGrid);
                commit('setMistakeCount', gameState.mistakeCount);
                commit('setDifficulty', gameState.difficulty);
            } else {
                await dispatch('generateSudoku');
            }
            commit('setIsLoaded', true);
        },
        generateSudoku({ commit, dispatch, state }) {
            const { grid, solvedGrid } = generateSudoku(state.difficulty);
            commit('setSudokuGrid', grid);
            commit('setInitialGrid', JSON.parse(JSON.stringify(grid)));
            commit('setSolvedSudokuGrid', solvedGrid);
            dispatch('saveGameState');

            return {
                sudokuGrid: grid,
                initialGrid: JSON.parse(JSON.stringify(grid)),
                solvedSudokuGrid: solvedGrid
            };
        },
        updateCell({ commit, state, dispatch }, payload) {
            if (state.initialGrid[payload.row][payload.col] === 0) {
                const currentValue = state.sudokuGrid[payload.row][payload.col];
                const correctValue = state.solvedSudokuGrid[payload.row][payload.col];

                commit('updateCell', payload);

                if (payload.number !== 0 && payload.number !== currentValue) {
                    if (payload.number !== correctValue) {
                        commit('incrementMistakeCount');
                    }
                }

                dispatch('saveGameState');
            }
        },
        saveGameState({ state }) {
            const gameState = {
                sudokuGrid: state.sudokuGrid,
                initialGrid: state.initialGrid,
                solvedSudokuGrid: state.solvedSudokuGrid,
                mistakeCount: state.mistakeCount,
                difficulty: state.difficulty,
            };
            localStorage.setItem('sudokuGameState', JSON.stringify(gameState));
        },
        resetGame({ dispatch, commit }) {
            commit('resetMistakeCount');
            return dispatch('generateSudoku');
        },
        setDifficulty({ commit, dispatch }, difficulty) {
            commit('setDifficulty', difficulty);
            return dispatch('generateSudoku');
        },
    },
});

function generateSudoku(difficulty) {
    const grid = createEmptyGrid();
    if (fillGrid(grid)) {
        const solvedGrid = JSON.parse(JSON.stringify(grid));
        removeNumbers(grid, difficulty);
        return { grid, solvedGrid };
    }
    return null; // 稀に生成に失敗した場合
}

function createEmptyGrid() {
    return Array(9).fill().map(() => Array(9).fill(0));
}

function fillGrid(grid) {
    const emptyCell = findEmptyCell(grid);
    if (!emptyCell) return true; // グリッドが完全に埋まっている

    const [row, col] = emptyCell;
    const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (const num of numbers) {
        if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (fillGrid(grid)) return true;
            grid[row][col] = 0; // バックトラック
        }
    }

    return false; // 解決策が見つからない
}

function removeNumbers(grid, difficulty) {
    const cellsToRemove = [];
    for (let i = 0; i < 81; i++) {
        cellsToRemove.push(i);
    }
    shuffleArray(cellsToRemove);

    const difficultySettings = {
        easy: { totalRemove: 35, maxPerColumn: 5 },
        normal: { totalRemove: 45, maxPerColumn: 6 },
        hard: { totalRemove: 55, maxPerColumn: 7 },
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
    // 行をチェック
    for (let x = 0; x < 9; x++) {
        if (grid[row][x] === num) return false;
    }

    // 列をチェック
    for (let x = 0; x < 9; x++) {
        if (grid[x][col] === num) return false;
    }

    // 3x3ボックスをチェック
    let startRow = row - row % 3,
        startCol = col - col % 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[i + startRow][j + startCol] === num) return false;
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