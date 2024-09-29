<!-- SudokuCell.vue -->
<template>
  <div class="cell" :class="{
    'selected': isSelected,
    'initial': isInitial,
    'incorrect': isIncorrect,
    'selectable': !isInitial,
    'floating': (isAnimating && value !== 0) || isSelected,
    'sinking': isAnimating && value === 0
  }" @click="selectCell">
    <template v-if="value !== 0">
      {{ value }}
    </template>
    <template v-else-if="hasPencilMarks">
      <div class="pencil-marks">
        <span v-for="n in 9" :key="n" class="pencil-mark" :class="{ 'visible': isPencilMark(n) }">
          {{ n }}
        </span>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  row: Number,
  col: Number,
  value: Number,
  isSelected: Boolean,
  isInitial: Boolean,
  isIncorrect: Boolean,
  isAnimating: Boolean,
  pencilMarks: Array,
});

const emit = defineEmits(['select']);

const hasPencilMarks = computed(() => props.pencilMarks.length > 0);

const isPencilMark = (number) => props.pencilMarks.includes(number);

const selectCell = () => {
  if (!props.isInitial) {
    emit('select', { row: props.row, col: props.col });
  }
};
</script>

<style scoped>
.cell {
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
  transition: all 0.3s ease-out;
  position: relative;
}

.pencil-marks {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  width: 100%;
  height: 100%;
  font-size: 10px;
  color: #666;
}

.pencil-mark {
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.pencil-mark.visible {
  opacity: 1
}

.selected {
  background-color: #e0e0e0;
}

.initial {
  color: #808080;
}

.incorrect {
  color: red;
}

.selectable {
  cursor: pointer;
}

.selectable:hover {
  background-color: #f0f0f0;
}

.floating {
  transform: translateZ(20px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  z-index: 1;
}

.sinking {
  animation: sink 0.3s ease-out forwards;
}

@keyframes sink {
  0% {
    transform: translateZ(20px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }

  100% {
    transform: translateZ(0);
    box-shadow: none;
  }
}
</style>