<script lang="ts" setup>
import { computed, onMounted, watch } from 'vue'
import { useMachine, useSelector } from '@xstate/vue'
import { createLevel } from '@/stores/single-entity-level'
import { gameMachine } from '@/state-machines/gameMachine'
import { level001 } from '@/assets/level-configs/level-001'

const gridX = 5;
const gridY = 5

const { grid, entities, addEntity, entityIds, updateEntity, moveEntity } = createLevel(level001.width, level001.height)

const { actorRef: gameActor, snapshot: gameSnapshot } = useMachine(gameMachine)

onMounted(() => {
  gameActor.start()
  level001.entities.forEach(entityConfig => addEntity(entityConfig.x, entityConfig.y, entityConfig.entity))
})

const turnActor = computed(() => {
  if (gameSnapshot.value.children['good-turn']) {
    const actorRef = useSelector(gameActor, (s) => s.children['good-turn']);
    const snapshot = useSelector(actorRef, (s) => s);
    return { actorRef: actorRef.value, snapshot: snapshot.value }
  }
  if (gameSnapshot.value.children['bad-turn']) {
    const actorRef = useSelector(gameActor, (s) => s.children['bad-turn']);
    const snapshot = useSelector(actorRef, (s) => s);
    return { actorRef: actorRef.value, snapshot: snapshot.value }
  }
  return undefined
})

const turnActorRef = computed(() => turnActor.value?.actorRef)
const turnSnapshot = computed(() => turnActor.value?.snapshot)
const turnContext = computed(() => turnActor.value?.snapshot?.context)

watch(turnSnapshot, (currentSnapshot) => {
  // ready to trigger animation
  if (!turnSnapshot.value?.context.selectedId) return
  if (currentSnapshot?.matches({ 'teamTurn': { 'selected': 'actionAnimation' } })) {
    if (currentSnapshot.context.action.type === 'move') {
      turnActorRef.value?.send({ type: 'turn.end' })
    }
    if (currentSnapshot.context.action.type === 'attack') {

    }
  }
})

</script>

<template>
  <div class="layout">
    <div>
      <button v-if="gameSnapshot.value === 'gameOpening'" @click="gameActor.send({ type: 'game.start' })">
        Start
      </button>

      <h2 v-if="turnSnapshot?.matches('teamTurn')">{{ turnContext?.teamId.toUpperCase() }} Team's Turn</h2>
      <!-- <div v-if="turnActor?.snapshot?.matches('teamTurn')" class="inputs"> -->
      <div v-if="turnSnapshot?.matches({ 'teamTurn': 'selected' })" class="inputs">
        <h4>{{ turnContext?.selectedId && entities[turnContext.selectedId].name }}</h4>
        <button @click="() => { turnActorRef?.send({ type: 'action.select', action: 'move' }) }">Move ➜</button>
        <button @click="() => { turnActorRef?.send({ type: 'action.select', action: 'attack' }) }">Attack ⚔️</button>
      </div>
    </div>
    <!-- GRID -->
    <div class="grid" @contextmenu.prevent="() => { turnActorRef?.send({ type: 'entity.deselect' }) }">
      <div v-for="( entityId, position ) in grid " :key="position" :class="{
        selected: entityId && turnContext?.selectedId === entityId,
        selectable: turnSnapshot?.matches({ 'teamTurn': 'unselected' }) && turnContext && entityId && entities[entityId].teamId === turnContext.teamId
      }" :text="entityId" @click="() => {

        // if in unselected state and occupied, send selection event
        if (turnSnapshot?.matches({ 'teamTurn': 'unselected' }) && entityId) {
          turnActorRef?.send({ type: 'entity.select', entityId: entityId });
        }
        // TODO: Check if target is valid target (no friendly fire, no moving to occupied positions, no attacking empty positions, etc.)

        // if in targetSelection state and there's a selectedId send target selection event
        if (turnSnapshot?.matches({ teamTurn: { 'selected': 'targetSelection' } }) && turnContext?.selectedId) {
          turnActorRef?.send({ type: 'target.select', target: position })
          const [newX, newY] = position.split('-')
          moveEntity(turnContext?.selectedId, Number(newX), Number(newY))
        }

      }">
        <div>
          <img v-if="entityId" draggable="false" class="idle"
            :src="`/characters/character-${entities[entityId].name}.png`" :alt="entities[entityId].name" />
        </div>
      </div>
    </div>
  </div>

  <div class="state">
    <pre>{{ gameSnapshot }}</pre>
  </div>

  <div class="state">
    <pre>{{ turnSnapshot }}</pre>
  </div>
</template>

<style scoped>
.turn {}

.layout {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 7fr 2fr;
}

.state {
  font-size: xx-small;
}

.inputs {
  display: grid;
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

div.selectable {
  border-style: solid;
  border-width: 2px;
  border-top-color: rgb(124, 225, 126, 0.9);
  border-left-color: rgb(67, 123, 65, 0.9);
  border-right-color: rgb(10, 66, 9, 0.9);
  border-bottom-color: rgb(10, 66, 9, 0.9);
  border-radius: 5px;
}

div.selected {
  border-style: solid;
  border-width: 3px;
  border-right-color: rgb(124, 225, 126, 0.9);
  border-bottom-color: rgb(67, 123, 65, 0.9);
  border-top-color: rgb(10, 66, 9, 0.9);
  border-left-color: rgb(10, 66, 9, 0.9);
  border-radius: 5px;
}
</style>