<script lang="ts" setup>
import { computed, ref } from 'vue'
import { createLevel, type Position } from '@/stores/single-entity-level'
import type { Entity, EntityId } from '@/stores/entity';

const gridX = 5;
const gridY = 5

const { grid, entities, addEntity, entityIds, updateEntity } = createLevel(gridX, gridY)

const selectedCells = ref<Set<Position>>(new Set())
const toggleSelectedCell = (position: Position) => {
  if (selectedCells.value.has(position)) {
    selectedCells.value.delete(position)
  } else {
    selectedCells.value.add(position)
  }
}

const selectedEntity = ref<string>('')
const currentKey = ref<keyof Entity>('health')
const value = ref<number>(0)

const currentKeys = computed(() => entityIds.value.length > 0 ? Object.keys(entities.value[selectedEntity.value]) : undefined)

</script>

<template>
  <div class="layout">
    <div>
      <div class="inputs">
        <label for="entity">Entity</label>
        <select v-model="selectedEntity" v-if="entityIds.length > 0" id="entity">
          <option v-for=" id  in  entityIds " :value="id" :key="id">{{ id }}</option>
        </select>
        <br />
        <label for="key">Key</label>
        <select v-if="selectedEntity" v-model="currentKey" id="key">
          <option v-for=" key  in  currentKeys " :value="key" :key="key">{{ key }}</option>
        </select>
        <input v-model="value" type="number">
        <button @click="() => updateEntity(selectedEntity, currentKey, value)">change value</button>
        <br />
        <button @click="() => {
          try {
            const id = addEntity(
              0, 0, {
              level: 1,
              name: 'Gobbie',
              skills: [],
              defense: 10,
              strength: 10,
              health: 10,
              speed: 10,
              status: [],
              magicSkill: 50,
            })
            console.log('successfully added: ', id)
          } catch (err) {
            console.log(err)

          }
        }
          ">addGoblin</button>
      </div>
    </div>

    <!-- GRID -->
    <div class="grid">
      <div :class="{ selected: selectedCells.has(position) }" @click="() => { toggleSelectedCell(position) }"
        v-for="( entityId, position ) in  grid " :key="position" :text="entityId">
        <div>
          {{ entityId ? entities[entityId].name : '' }}
        </div>
      </div>
    </div>
  </div>



</template>

<style scoped>
.selectable-entity {
  border: 1px solid silver;
  border-radius: 2px;
  margin-bottom: 1px;
  padding: 1px;
}

.layout {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 2fr 7fr;
}

.inputs>* {
  font-size: xx-small;
}

.text {
  border: 1px solid gray;
  padding: 20px;
  border-radius: 5px;
  font-size: xx-small;
  color: gray;
  max-height: 250px;
  overflow-y: scroll;
}

.grid {
  background: url(backgrounds/forest-01.png);
  image-rendering: pixelated;
  user-select: none;
  width: 240px;
  height: 240px;
  margin: auto;
  padding: 10px;
  font-size: xx-small;
  /* width: calc(v-bind(gridX)*40px); */
  justify-content: center;
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(v-bind(gridX), 40px);
  grid-template-rows: repeat(v-bind(gridY), 40px);
}

.grid>div {
  display: grid;
  place-items: center;
  border-radius: 1px;
  border: 1px dotted rgba(255, 255, 255, 0.5);
}

div.selected {
  border: 1px dashed rgba(255, 255, 255, 0.9);
  color: white;
}
</style>