<template>
    <div class="update-history">
        <h2>更新履歴</h2>
        <ul>
            <li v-for="update in updates" :key="update.date">
                <strong>{{ update.date }}</strong>: {{ update.description }}
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const updates = ref([
    {
        date: '2024-08-05',
        description: '難易度設定機能を追加'
    },
    {
        date: '2024-08-04',
        description: '初回リリース'
    },
])
</script>

<style scoped>
.update-history {
    margin: 20px;
    padding: 15px;
    background-color: #f5f5f5;
    border-radius: 8px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

h2 {
    color: #333;
    border-bottom: 2px solid #333;
    padding-bottom: 10px;
}

ul {
    list-style-type: none;
    padding: 0;
}

li {
    margin-bottom: 10px;
    line-height: 1.5;
}

strong {
    color: #555;
}
</style>