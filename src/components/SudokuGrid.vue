<!-- SudokuGrid.vue -->
<template>
  <div class="sudoku-container">
    <div class="sudoku-grid" :class="{ 'animating': isAnimating, 'locked': isGameLocked }">
      <SudokuCell
        v-for="(cell, index) in flattenedGrid"
        :key="index"
        :row="Math.floor(index / 9)"
        :col="index % 9"
        :value="cell"
        :isSelected="isSelected(Math.floor(index / 9), index % 9)"
        :isInitial="isInitialCell(Math.floor(index / 9), index % 9)"
        :isIncorrect="isIncorrectCell(Math.floor(index / 9), index % 9)"
        :isAnimating="isAnimating"
        :pencilMarks="getPencilMarks(Math.floor(index / 9), index % 9)"
        @select="selectCell"
      />
    </div>
    <div v-if="showClearOverlay" class="clear-overlay">
      <span class="clear-text">Clear!</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useSudokuStore } from '../store/sudokuStore';
import { defineProps, defineEmits, defineExpose } from 'vue';
import SudokuCell from './SudokuCell.vue';

const props = defineProps({
  selectedCell: Object,
  isPencilMode: Boolean,
  isGameLocked: Boolean,
  showClearOverlay: Boolean
});

const emit = defineEmits(['cell-selected']);

const store = useSudokuStore();
const isAnimating = ref(false);
const animationGrid = ref([]);

const sudokuGrid = computed(() => store.sudokuGrid);
const initialGrid = computed(() => store.initialGrid);
const solvedSudokuGrid = computed(() => store.solvedSudokuGrid);
const pencilMarks = computed(() => store.pencilMarks);

const flattenedGrid = computed(() =>
  isAnimating.value ? animationGrid.value.flat() : sudokuGrid.value.flat()
);

const selectCell = ({ row, col }) => {
  if (!isAnimating.value && !props.isGameLocked) {
    emit('cell-selected', { row, col });
  }
};

const isSelected = (row, col) =>
  props.selectedCell && props.selectedCell.row === row && props.selectedCell.col === col;

const isInitialCell = (row, col) => initialGrid.value[row][col] !== 0;

const isIncorrectCell = (row, col) =>
  sudokuGrid.value[row][col] !== 0 &&
  sudokuGrid.value[row][col] !== solvedSudokuGrid.value[row][col];

const getPencilMarks = (row, col) => pencilMarks.value[row][col];

const generateRandomGrid = () =>
  Array(9).fill().map(() => Array(9).fill().map(() => Math.floor(Math.random() * 9) + 1));

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const playResetAnimation = async (newState) => {
  isAnimating.value = true;
  animationGrid.value = generateRandomGrid();

  await wait(300);

  for (let k = 0; k < 5; k++) {
    animationGrid.value = generateRandomGrid();
    await wait(50);
  }

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (newState.initialGrid[i][j] === 0) {
        animationGrid.value[i][j] = 0;
        await wait(15);
      }
    }
  }

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (newState.initialGrid[i][j] !== 0) {
        animationGrid.value[i][j] = newState.initialGrid[i][j];
        await wait(15);
      }
    }
  }

  await wait(300);
  isAnimating.value = false;

  store.setSudokuGrid(newState.sudokuGrid);
  store.setInitialGrid(newState.initialGrid);
  store.setSolvedSudokuGrid(newState.solvedSudokuGrid);
};

defineExpose({ playResetAnimation });
</script>

<style scoped>
.sudoku-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
  position: relative;
}

.sudoku-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(9, 1fr);
  gap: 1px;
  background-color: #000;
  border: 2px solid #000;
  width: 450px;
  height: 450px;
  perspective: 1000px;
}

.sudoku-grid.locked .cell {
  cursor: not-allowed;
}

.clear-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.7);
  z-index: 10;
}

.clear-text {
  font-size: 80px;
  font-weight: bold;
  color: #4CAF50;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  transform: rotate(-30deg);
  animation: pop-in 0.5s ease-out;
}

@keyframes pop-in {
  0% {
    transform: scale(0) rotate(-30deg);
    opacity: 0;
  }

  80% {
    transform: scale(1.2) rotate(-30deg);
    opacity: 1;
  }

  100% {
    transform: scale(1) rotate(-30deg);
    opacity: 1;
  }
}
</style>