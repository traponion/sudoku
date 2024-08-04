<template>
  <div id="app" v-if="isLoaded">
    <h1 class="game-title">数独ゲーム</h1>
    <SudokuGrid @cell-selected="onCellSelected" :selectedCell="selectedCell" ref="sudokuGrid" />
    <div class="number-selector">
      <div v-for="n in 9" :key="n" @click="selectNumber(n)" class="number">
        {{ n }}
      </div>
      <div @click="eraseNumber" class="number eraser">
        消
      </div>
    </div>
    <GameControls @game-reset="onGameReset" />
    <p class="mistake-count">間違った回数: {{ mistakeCount }}</p>
  </div>
</template>

<script>
import SudokuGrid from './components/SudokuGrid.vue';
import GameControls from './components/GameControls.vue';
import { mapState } from 'vuex';

export default {
  name: 'App',
  components: {
    SudokuGrid,
    GameControls,
  },
  data() {
    return {
      selectedCell: null,
    };
  },
  computed: {
    ...mapState(['mistakeCount', 'sudokuGrid', 'isLoaded']),
  },
  methods: {
    onCellSelected(cell) {
      this.selectedCell = cell;
    },
    selectNumber(number) {
      if (this.selectedCell) {
        this.$store.dispatch('updateCell', { ...this.selectedCell, number });
      }
    },
    eraseNumber() {
      if (this.selectedCell) {
        this.$store.dispatch('updateCell', { ...this.selectedCell, number: 0 });
      }
    },
    async onGameReset() {
      this.selectedCell = null;
      // 新しい数独を生成し、その状態を取得
      const newSudokuState = await this.$store.dispatch('resetGame');
      // 新しい状態でアニメーションを実行
      await this.$refs.sudokuGrid.playResetAnimation(newSudokuState);
    },
  },
  mounted() {
    this.$store.dispatch('loadGameState');
  },
};
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
  /* 重要な機能なので色を使用 */
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
</style>