<template>
  <div class="game-controls">
    <button @click="togglePencilMode"
      :class="['pencil-mode-button', { active: isPencilMode }, 'exclude-from-deselect']">
      {{ isPencilMode ? '仮置きモード: ON' : '仮置きモード: OFF' }}
    </button>
    <div class="difficulty-selector">
      <button v-for="diff in ['easy', 'normal', 'hard']" :key="diff" @click="changeDifficulty(diff)"
        :class="['difficulty-button', { active: currentDifficulty === diff }]">
        {{ diff.charAt(0).toUpperCase() + diff.slice(1) }}
      </button>
    </div>
    <button @click="showResetConfirmation" class="reset-button">リセット</button>
    <ConfirmModal :isOpen="isModalOpen" title="ゲームリセット" message="本当にゲームをリセットしますか？進行状況は失われます。" @confirm="confirmReset"
      @cancel="cancelReset" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useSudokuStore } from '../store/sudokuStore';
import ConfirmModal from './ConfirmModal.vue';

const sudokuStore = useSudokuStore();
const emit = defineEmits(['game-reset', 'difficulty-changed', 'toggle-pencil-mode', 'clear-game']);

const isModalOpen = ref(false);
const isPencilMode = ref(false);

const currentDifficulty = computed(() => sudokuStore.difficulty);

const showResetConfirmation = () => {
  isModalOpen.value = true;
};

const confirmReset = async () => {
  emit('clear-game');  // 即座にクリア表示を消す
  const newState = await sudokuStore.resetGame();
  emit('game-reset', newState);
  isModalOpen.value = false;
};

const cancelReset = () => {
  isModalOpen.value = false;
};

const changeDifficulty = async (newDifficulty) => {
  if (currentDifficulty.value !== newDifficulty) {
    emit('clear-game');  // 即座にクリア表示を消す
    const newState = await sudokuStore.setDifficultyAction(newDifficulty);
    emit('difficulty-changed', newState);
  }
};

const togglePencilMode = () => {
  isPencilMode.value = !isPencilMode.value;
  emit('toggle-pencil-mode', isPencilMode.value);
};
</script>

<style scoped>
.game-controls {
  margin-top: 20px;
  text-align: center;
}

.reset-button {
  padding: 10px 20px;
  font-size: 16px;
  color: white;
  background-color: #333;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-bottom: 10px;
}

.reset-button:hover {
  background-color: #555;
}

.difficulty-selector {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
}

.difficulty-button {
  padding: 8px 16px;
  font-size: 14px;
  color: #333;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.difficulty-button:hover {
  background-color: #e0e0e0;
}

.difficulty-button.active {
  color: white;
  background-color: #4CAF50;
  border-color: #45a049;
}

.pencil-mode-button {
  padding: 8px 16px;
  font-size: 14px;
  color: #333;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 10px;
}

.pencil-mode-button:hover {
  background-color: #e0e0e0;
}

.pencil-mode-button.active {
  color: white;
  background-color: #2196F3;
  border-color: #1E88E5;
}

.reset-button {
  margin-top: 10px;
}
</style>