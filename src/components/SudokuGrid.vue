<template>
    <div class="sudoku-container">
        <div class="sudoku-grid" :class="{ 'animating': isAnimating }">
            <div v-for="(cell, index) in flattenedGrid" :key="index" class="cell" :class="{
                'selected': isSelected(Math.floor(index / 9), index % 9),
                'initial': isInitialCell(Math.floor(index / 9), index % 9),
                'incorrect': isIncorrectCell(Math.floor(index / 9), index % 9),
                'selectable': !isInitialCell(Math.floor(index / 9), index % 9),
                'floating': (isAnimating && cell !== 0) || isSelected(Math.floor(index / 9), index % 9),
                'sinking': isAnimating && cell === 0
            }" @click="selectCell(Math.floor(index / 9), index % 9)">
                {{ cell !== 0 ? cell : '' }}
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
    name: 'SudokuGrid',
    props: ['selectedCell'],
    data() {
        return {
            isAnimating: false,
            animationGrid: [],
        };
    },
    computed: {
        ...mapState(['sudokuGrid', 'initialGrid', 'solvedSudokuGrid']),
        flattenedGrid() {
            return this.isAnimating ? this.animationGrid.flat() : this.sudokuGrid.flat();
        }
    },
    methods: {
        selectCell(row, col) {
            if (!this.isInitialCell(row, col) && !this.isAnimating) {
                this.$emit('cell-selected', { row, col });
            }
        },
        isSelected(row, col) {
            return this.selectedCell && this.selectedCell.row === row && this.selectedCell.col === col;
        },
        isInitialCell(row, col) {
            return this.initialGrid[row][col] !== 0;
        },
        isIncorrectCell(row, col) {
            return this.sudokuGrid[row][col] !== 0 &&
                this.sudokuGrid[row][col] !== this.solvedSudokuGrid[row][col];
        },

        generateRandomGrid() {
            return Array(9).fill().map(() => Array(9).fill().map(() => Math.floor(Math.random() * 9) + 1));
        },
        async playResetAnimation(newState) {
            this.isAnimating = true;
            this.animationGrid = this.generateRandomGrid();

            // 全てのセルを浮かせた状態で開始
            await this.wait(500);

            // ランダムに数字を変える
            for (let k = 0; k < 10; k++) {
                for (let i = 0; i < 9; i++) {
                    for (let j = 0; j < 9; j++) {
                        this.animationGrid[i][j] = Math.floor(Math.random() * 9) + 1;
                    }
                }
                await this.wait(100);
            }

            // 空白セルを沈める
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (newState.initialGrid[i][j] === 0) {
                        this.animationGrid[i][j] = 0;
                        await this.wait(30);
                    }
                }
            }

            // 残りの数字を正しい値に設定
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    if (newState.initialGrid[i][j] !== 0) {
                        this.animationGrid[i][j] = newState.initialGrid[i][j];
                        await this.wait(30);
                    }
                }
            }

            // アニメーション終了後の処理
            await this.wait(500);
            this.isAnimating = false;

            // ストアの状態を更新
            this.$store.commit('setSudokuGrid', newState.sudokuGrid);
            this.$store.commit('setInitialGrid', newState.initialGrid);
            this.$store.commit('setSolvedSudokuGrid', newState.solvedSudokuGrid);
        },

        wait(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }
    }
};
</script>
<style scoped>
.sudoku-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px 0;
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

.cell {
    background-color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    font-weight: bold;
    transition: all 0.3s ease-out;
}

.cell:nth-child(3n) {
    border-right: 2px solid #000;
}

.cell:nth-child(n+19):nth-child(-n+27),
.cell:nth-child(n+46):nth-child(-n+54) {
    border-bottom: 2px solid #000;
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

.animating {
    transition: all 0.1s;
}

.animating .cell {
    color: #000000 !important;
}

.animating .cell:not(.floating) {
    color: #808080 !important; /* アニメーション中の非浮遊セルは灰色 */
}

.floating {
    transform: translateZ(20px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    z-index: 1; /* 他のセルよりも前面に表示 */
}


.sinking {
    animation: sink 0.3s ease-out forwards;
}

@keyframes sink {
    0% {
        transform: translateZ(20px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
    }
    100% {
        transform: translateZ(0);
        box-shadow: none;
    }
}
</style>