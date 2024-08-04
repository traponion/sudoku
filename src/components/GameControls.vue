<template>
    <div class="game-controls">
        <button @click="showResetConfirmation" class="reset-button">リセット</button>
        <ConfirmModal :isOpen="isModalOpen" title="ゲームリセット" message="本当にゲームをリセットしますか？進行状況は失われます。"
            @confirm="confirmReset" @cancel="cancelReset" />
    </div>
</template>

<script>
import ConfirmModal from './ConfirmModal.vue';

export default {
    name: 'GameControls',
    components: {
        ConfirmModal,
    },
    data() {
        return {
            isModalOpen: false,
        };
    },
    methods: {
        showResetConfirmation() {
            this.isModalOpen = true;
        },
        confirmReset() {
            this.$store.dispatch('resetGame');
            this.$emit('game-reset');
            this.isModalOpen = false;
        },
        cancelReset() {
            this.isModalOpen = false;
        },
    },
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
}

.reset-button:hover {
    background-color: #555;
}
</style>