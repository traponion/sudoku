<template>
  <div id="app" v-if="isLoaded">
    <h1 class="game-title">数独ゲーム</h1>
    <SudokuGrid @cell-selected="onCellSelected" :selectedCell="selectedCell" :isPencilMode="isPencilMode"
      ref="sudokuGrid" />
    <div class="number-selector" @mousedown.stop>
      <div v-for="n in 9" :key="n" @click="selectNumber(n)" class="number">
        {{ n }}
      </div>
      <div @click="eraseNumber" class="number eraser">
        消
      </div>
    </div>
    <GameControls @game-reset="onGameReset" @difficulty-changed="onDifficultyChanged"
      @toggle-pencil-mode="togglePencilMode" />
    <p class="mistake-count">間違った回数: {{ mistakeCount }}</p>
    <p class="current-difficulty">現在の難易度: {{ difficulty }}</p>
    <UpdateHistory />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useSudokuStore } from './store/sudokuStore';
import SudokuGrid from './components/SudokuGrid.vue';
import GameControls from './components/GameControls.vue';
import UpdateHistory from './components/UpdateHistory.vue';

const store = useSudokuStore();
const isPencilMode = ref(false);


const togglePencilMode = () => {
  isPencilMode.value = !isPencilMode.value;
};

const selectedCell = ref(null);
const sudokuGrid = ref(null);

const mistakeCount = computed(() => store.mistakeCount);
const isLoaded = computed(() => store.isLoaded);
const difficulty = computed(() => store.difficulty);

const onCellSelected = (cell) => {
  selectedCell.value = cell;
};

const selectNumber = (number) => {
  if (selectedCell.value) {
    const { row, col } = selectedCell.value;
    if (isPencilMode.value) {
      store.setPencilMark(row, col, number);
    } else {
      store.updateCellAction({ ...selectedCell.value, number });
      store.clearPencilMarks(row, col);
    }

  }
};

const eraseNumber = () => {
  if (selectedCell.value) {
    const { row, col } = selectedCell.value;
    if (isPencilMode.value) {
      store.clearPencilMarks(row, col);
    } else {
      store.updateCellAction({ ...selectedCell.value, number: 0 });
    }
  }
};

const onGameReset = async (newState) => {
  selectedCell.value = null;
  await sudokuGrid.value.playResetAnimation(newState);
};

const onDifficultyChanged = async (newState) => {
  selectedCell.value = null;
  await sudokuGrid.value.playResetAnimation(newState);
};

onMounted(() => {
  store.loadGameState();

  document.addEventListener('mousedown', handleOutsideClick);
});

const handleOutsideClick = (event) => {
  const sudokuGridElement = document.querySelector('.sudoku-grid');
  const numberSelectorElement = document.querySelector('.number-selector');
  const pencilModeButton = document.querySelector('.exclude-from-deselect');
  if (
    sudokuGridElement &&
    !sudokuGridElement.contains(event.target) &&
    !numberSelectorElement.contains(event.target) &&
    !pencilModeButton.contains(event.target)  // 新しい条件を追加
  ) {
    selectedCell.value = null;
  }
};
onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutsideClick);
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #333;
  margin-top: 60px;
}

.game-title {
  font-size: 2em;
  margin-bottom: 20px;
  color: #333;
}

.number-selector {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.number {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #e0e0e0;
  color: #333;
  margin: 0 5px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 18px;
  font-weight: bold;
  transition: background-color 0.3s;
}

.number:hover {
  background-color: #ccc;
}

.eraser {
  background-color: #f44336;
  color: white;
}

.eraser:hover {
  background-color: #d32f2f;
}

.mistake-count {
  margin-top: 20px;
  font-size: 18px;
  font-weight: bold;
  color: #000;
}

.current-difficulty {
  margin-top: 10px;
  font-size: 16px;
  font-weight: bold;
}
</style>