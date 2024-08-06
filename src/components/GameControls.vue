<template>
    <div class="game-controls">
        <button @click="showResetConfirmation" class="reset-button">リセット</button>
        <div class="difficulty-selector">
            <button v-for="diff in ['easy', 'normal', 'hard']" :key="diff" @click="changeDifficulty(diff)"
                :class="['difficulty-button', { active: currentDifficulty === diff }]">
                {{ diff.charAt(0).toUpperCase() + diff.slice(1) }}
            </button>
        </div>
        <ConfirmModal :isOpen="isModalOpen" title="ゲームリセット" message="本当にゲームをリセットしますか？進行状況は失われます。"
            @confirm="confirmReset" @cancel="cancelReset" />
    </div>
</template>

<script setup>
import { ref, computed, defineEmits } from 'vue';
import { useStore } from 'vuex';
import ConfirmModal from './ConfirmModal.vue';

const store = useStore();
const emit = defineEmits(['game-reset', 'difficulty-changed']);

const isModalOpen = ref(false);

const currentDifficulty = computed(() => store.state.difficulty);

const showResetConfirmation = () => {
    isModalOpen.value = true;
};

const confirmReset = () => {
    store.dispatch('resetGame');
    emit('game-reset');
    isModalOpen.value = false;
};

const cancelReset = () => {
    isModalOpen.value = false;
};

const changeDifficulty = (newDifficulty) => {
    if (currentDifficulty.value !== newDifficulty) {
        emit('difficulty-changed', newDifficulty);
    }
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
</style>