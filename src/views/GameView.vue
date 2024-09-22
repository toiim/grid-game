<script lang="ts" setup>
import { ref, computed } from 'vue';

const featureSymbols = {
  monster: "👾",
  castle: "🏰",
  treasure: "💰",
  village: "🏘️",
  lake: "🔵"
} as const;

type TFeatureSymbols = typeof featureSymbols
type Feature = keyof TFeatureSymbols;

const levels = [
  {
    level: 1,
    gridSize: { rows: 5, cols: 5 },
    features: [
      { id: "monster", position: { x: 2, y: 3 } },
      { id: "castle", position: { x: 4, y: 1 } },
      { id: "treasure", position: { x: 0, y: 0 } }
    ]
  },
  {
    level: 2,
    gridSize: { rows: 3, cols: 6 },
    features: [
      { id: "monster", position: { x: 1, y: 4 } },
      { id: "village", position: { x: 2, y: 2 } },
      { id: "lake", position: { x: 0, y: 5 } }
    ]
  }
];

const currentLevel = ref(0)
// const currentLevelFeatures = computed(() => {
//   const locationLookup = levels[currentLevel.value].features.reduce((acc, feature) => { acc[`${feature.position.x}-${feature.position.y}`] = featureSymbols[feature.id as Feature]; return acc }, {} as any)
//   return locationLookup
// })

const cellSize = 100 / Math.max(...levels.map(level => Math.max(level.gridSize.rows, level.gridSize.cols)));

const currentLevelFeatures = computed(() => {
  return levels[currentLevel.value].features.reduce((acc, feature) => {
    acc[`${feature.position.x}-${feature.position.y}`] = featureSymbols[feature.id as Feature];
    return acc;
  }, {} as Record<string, string>);
});

const featureXPosition = (key: string) => {
  const [, col] = key.split('-').map(Number);
  return col * cellSize + cellSize / 2;
};

const featureYPosition = (key: string) => {
  const [row] = key.split('-').map(Number);
  return row * cellSize + cellSize / 2;
};

const nextLevel = () => {
  if (currentLevel.value < levels.length - 1) {
    currentLevel.value++;
  }
};

const previousLevel = () => {
  if (currentLevel.value > 0) {
    currentLevel.value--;
  }
};
</script>

<template>
  <div class="centre">
    <svg width="100" height="100" viewBox="0 0 100 100">
      <!-- Draw the grid -->
      <g v-for="(row, rowIndex) in levels[currentLevel].gridSize.rows" :key="`row-${rowIndex}`">
        <rect v-for="(col, colIndex) in levels[currentLevel].gridSize.cols" :key="`col-${colIndex}`"
          :x="colIndex * cellSize" :y="rowIndex * cellSize" :width="cellSize" :height="cellSize" fill="none"
          stroke="#000" stroke-width="0.5" />
      </g>

      <!-- Place the features -->
      <text v-for="(feature, key) in currentLevelFeatures" :key="key" :x="featureXPosition(key)"
        :y="featureYPosition(key)" font-size="5" text-anchor="middle" alignment-baseline="central">
        {{ feature }}
      </text>
    </svg>

  </div>
  <div style="margin-top: 20px;">
    <button @click="previousLevel" :disabled="currentLevel === 0">Previous Level</button>
    <button @click="nextLevel" :disabled="currentLevel === levels.length - 1">Next Level</button>
  </div>
  <div class="arrows">
    <div></div>
    <div>⬆️</div>
    <div></div>
    <div>⬅️</div>
    <div>⬇️</div>
    <div>➡️</div>
  </div>
</template>

<style>
.arrows {
  width: 60px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.centre {
  display: flex;
  align-items: center;
  justify-items: center;
}
</style>