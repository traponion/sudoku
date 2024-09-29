<template>
    <div v-if="isOpen" class="modal-overlay">
        <div class="modal-container">
            <div class="modal-content">
                <h2>ゲームクリア！</h2>
                <p>おめでとうございます！数独をクリアしました。</p>
                <button @click="close" class="close-button">閉じる</button>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    isOpen: Boolean,
});

const emit = defineEmits(['close']);

const close = () => {
    emit('close');
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-container {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    text-align: center;
}

.modal-content h2 {
    color: #4CAF50;
    margin-bottom: 10px;
}

.close-button {
    margin-top: 20px;
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

.close-button:hover {
    background-color: #45a049;
}
</style>