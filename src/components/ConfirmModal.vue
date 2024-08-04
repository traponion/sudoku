<template>
    <div v-if="isOpen" class="modal-overlay">
        <div class="modal-container">
            <div class="modal-content">
                <h3 class="modal-title">{{ title }}</h3>
                <p class="modal-message">{{ message }}</p>
                <div class="modal-actions">
                    <button @click="confirm" class="btn btn-confirm">確認</button>
                    <button @click="cancel" class="btn btn-cancel">キャンセル</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ConfirmModal',
    props: {
        isOpen: Boolean,
        title: String,
        message: String,
    },
    methods: {
        confirm() {
            this.$emit('confirm');
        },
        cancel() {
            this.$emit('cancel');
        },
    },
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
}

.modal-container {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    width: 300px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.modal-title {
    font-size: 1.2em;
    margin-bottom: 10px;
    font-weight: bold;
    color: #333;
}

.modal-message {
    margin-bottom: 20px;
    color: #666;
}

.modal-actions {
    display: flex;
    justify-content: space-between;
}

.btn {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1em;
    transition: background-color 0.3s;
}

.btn-confirm {
    background-color: #333;
    color: white;
}

.btn-confirm:hover {
    background-color: #555;
}

.btn-cancel {
    background-color: #ccc;
    color: #333;
}

.btn-cancel:hover {
    background-color: #999;
}
</style>