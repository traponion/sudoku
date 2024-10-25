// sudokuService.js
export function generateSudoku(difficulty) {
  const grid = createEmptyGrid();
  if (fillGrid(grid)) {
    const solvedGrid = JSON.parse(JSON.stringify(grid));
    removeNumbers(grid, difficulty);
    return { grid, solvedGrid };
  }
  return null;
}

export function isValid(grid, row, col, num) {
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

export function solveSudoku(grid) {
  const emptyCell = findEmptyCell(grid);
  if (!emptyCell) return true;

  const [row, col] = emptyCell;
  for (let num = 1; num <= 9; num++) {
    if (isValid(grid, row, col, num)) {
      grid[row][col] = num;
      if (solveSudoku(grid)) return true;
      grid[row][col] = 0;
    }
  }

  return false;
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
  solveSudokuMultiple(grid, solutions, 2);
  return solutions.length === 1;
}

function solveSudokuMultiple(grid, solutions, limit) {
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
      solveSudokuMultiple(grid, solutions, limit);
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

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}