<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useMachine } from '@xstate/vue'
import { createLevel, type Position } from '@/stores/single-entity-level'
import { handleTurnsMachine } from '@/state-machines/handleTurns'
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

const { actorRef: handleTurnsActor, snapshot: handleTurnsSnapshot } = useMachine(handleTurnsMachine)

const selectedEntity = ref<string>('')
const currentKey = ref<keyof Entity>('health')
const value = ref<number>(0)

const currentKeys = computed(() => entityIds.value.length > 0 ? Object.keys(entities.value[selectedEntity.value]) : undefined)

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

onMounted(() => {
  handleTurnsActor.start()
  addEntity(
    0, 0, {
    level: 1,
    name: Math.random() < 0.5 ? (Math.random() < 0.5 ? 'purple' : 'red') : 'blue',
    skills: [],
    defense: 10,
    strength: 10,
    health: 10,
    speed: 10,
    status: [],
    magicSkill: 50,
  })

})

</script>

<template>
  <div class="layout">

    <button v-if="handleTurnsSnapshot.value === 'startGame'" @click="handleTurnsActor.send({ type: 'start' })">
      Start
    </button>

    <div v-if="handleTurnsSnapshot.matches('playerTurn')" class="inputs">
      <div v-if="selectedEntity">
        <p>{{ entities[selectedEntity].name }}</p>
        <pre>
            {{ entities[selectedEntity] }}
          </pre>
        <button @click="wantsToMove = true">move</button>
        <button>attack</button>
      </div>
    </div>


    <!-- GRID -->
    <div class="grid"
      @contextmenu.prevent="() => { console.log('entity.deselect'); handleTurnsActor.send({ type: 'entity.deselect' }) }">
      <div v-for="( entityId, position ) in  grid " :key="position"
        :class="{ selected: entityId && handleTurnsSnapshot.context.selectedId === entityId }" :text="entityId"
        @click="() => { entityId && handleTurnsActor.send({ type: 'entity.select', entityId: entityId }) }">
        <div>
          <img v-if="entityId" draggable="false" class="idle"
            :src="`/characters/character-${entities[entityId].name}.png`" :alt="entities[entityId].name" />
        </div>
      </div>
    </div>
  </div>

  <div>
    <pre>{{ handleTurnsSnapshot }}</pre>
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
  grid-template-columns: 7fr 2fr;
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