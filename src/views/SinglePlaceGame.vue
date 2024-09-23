<script lang="ts" setup>
import { computed, ref } from 'vue'
import { createLevel, type Position } from '@/stores/single-entity-level'
import type { Entity, EntityId } from '@/stores/entity';
import ToolTip from '@/components/ToolTip.vue';

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

type Action = {
  actor: EntityId
  type: 'move' | 'attack'
  target?: EntityId[]
  targetPositions: Position[]
}
const action = ref<Action>({
  actor: selectedEntity.value,
  type: 'move',
  targetPositions: selectedCells.value
})
// needs to be an action
const wantsToMove = ref<boolean>(false)

const handlePositionClick = (position: Position) => {

  if (wantsToMove.value) {
    const [newX, newY] = position.split('-').map(v => Number(v))
    entities.value[selectedEntity.value].move(newX, newY)
    deselect()
    wantsToMove.value = false
    return
  }

  //deselect
  if (grid.value[position] === selectedEntity.value) {
    deselect()
    wantsToMove.value = false
    return
  }
  // deselect actor
  // --> remove actions --> clear selected action

  // select actor if position has entity
  if (grid.value[position]) {
    selectedCells.value.clear()
    selectedCells.value.add(position)
    selectedEntity.value = grid.value[position]
    return
  }


  // select action
  // select target
}

const deselect = () => {
  selectedCells.value.clear()
  selectedEntity.value = ''
}

</script>

<template>
  <div class="layout">
    <div>
      <div class="inputs">
        <div v-if="selectedEntity">
          <p>{{ entities[selectedEntity].name }}</p>
          <pre>
            {{ entities[selectedEntity] }}
          </pre>
          <button @click="wantsToMove = true">move</button>
          <button>attack</button>
        </div>
        <br />
        <button @click="() => {
          try {
            const id = addEntity(
              0, 0, {
              level: 1,
              name: Math.random() < 0.5 ? 'red' : 'blue',
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
    <div class="grid" @contextmenu.prevent="deselect">
      <div :class="{ selected: selectedCells.has(position) }" @click="() => { handlePositionClick(position) }"
        v-for="( entityId, position ) in  grid " :key="position" :text="entityId">
        <div>
          <img draggable="false" class="idle" v-if="entityId"
            :src="`/characters/chararacter-${entities[entityId].name}.png`" :alt="entities[entityId].name" />
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

.grid img {
  user-select: none;
  position: relative;
  top: -11px;
}

.idle {
  animation: 0.7s linear 0s infinite idle;
  transform-origin: bottom;
}

@keyframes idle {
  0% {
    transform: scaleY(1);
  }

  20% {
    transform: scaleY(0.95);
  }

  30% {
    transform: scaleY(1);
  }

  90% {
    transform: scaleY(1.02);
  }

  100% {
    transform: scaleY(1);
  }
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