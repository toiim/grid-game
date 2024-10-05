<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useMachine, useSelector } from '@xstate/vue'
import { createLevel, type Position } from '@/stores/single-entity-level'
import { gameMachine } from '@/state-machines/gameMachine'
import { level001 } from '@/assets/level-configs/level-001'
import type { Subscription } from 'xstate'
import type { EntityId } from '@/stores/entity'

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

// TODO: figure out smarter way to do this
// To remember the logic, essentially when a turn starts it needs to sub, and ends it needs to unsub
const subscription = ref<Subscription | undefined>(undefined)
watch(turnActor, (newActor, oldActor) => {
  if (!newActor?.actorRef?.id) return
  if (gameSnapshot.value.matches('turn') && !subscription.value) {

    subscription.value = turnActorRef.value?.on('entity.move', ({ entityId, target }) => {
      const [newX, newY] = target.split('-').map(Number)
      moveEntity(entityId, Number(newX), Number(newY))
    })

    // add new subscriptions ie 'entity.attack'

  }
  if (!oldActor?.actorRef?.id) return
  if (newActor.actorRef.id !== oldActor?.actorRef?.id) {
    subscription.value?.unsubscribe()
    subscription.value = undefined
  }
})

const selectableMovePositions = computed<Set<Position>>(() => {
  const range = 1

  const selectedId = turnContext.value?.selectedId
  const actionType = turnContext.value?.action.type
  if (!selectedId || actionType !== 'move') return new Set<Position>()
  const initialPosition = entities.value[selectedId].position
  const [initialX, initialY] = initialPosition.split('-').map((char) => Number(char))
  const surroundingPositions = new Set<Position>()
  for (let x = -range; x < range + 1; x++) {
    for (let y = -range; y < range + 1; y++) {
      surroundingPositions.add(`${initialX + x}-${initialY + y}`)
    }
  }
  // for move only
  surroundingPositions.forEach((pos) => {
    if (grid.value[pos]) surroundingPositions.delete(pos)
  })
  // for attack it would check that they exist
  surroundingPositions.delete(initialPosition)
  return surroundingPositions
})

type PositionStates =
  | 'isSelectable'
  | 'isSelected'
  | 'isValidAttackTarget'
  | 'isValidMoveTarget'
const getPositionStates = (position: Position, entityId: EntityId | undefined): Record<PositionStates, boolean> => ({
  isSelectable: !!(turnSnapshot.value?.matches({ 'teamTurn': 'unselected' }) && turnContext && entityId && entities.value[entityId].teamId === turnContext.value?.teamId),
  isSelected: !!(entityId && turnContext.value?.selectedId === entityId),
  isValidAttackTarget: false,
  isValidMoveTarget: selectableMovePositions.value.has(position),
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
      <button v-if="turnSnapshot?.matches('teamTurn')" @click="turnActorRef?.send({ type: 'turn.end' })">End
        Turn</button>
    </div>

    <!-- GRID -->
    <div class="grid" @contextmenu.prevent="() => { turnActorRef?.send({ type: 'entity.deselect' }) }">
      <div v-for="( entityId, position ) in grid " :key="position" :class="getPositionStates(position, entityId)"
        :text="entityId" @click="() => {
          const positionState = getPositionStates(position, entityId)
          // if in unselected state and occupied, send selection event
          if (entityId && positionState.isSelectable) {
            turnActorRef?.send({ type: 'entity.select', entityId: entityId });
          }
          // TODO: Check if target is valid target (no friendly fire, no moving to occupied positions, no attacking empty positions, etc.)

          // if in targetSelection state and there's a selectedId send target selection event
          if (positionState.isValidMoveTarget || positionState.isValidAttackTarget) {
            turnActorRef?.send({ type: 'target.select', target: position })
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

.isValidMoveTarget {
  transition: transform 0.2s ease;
  animation: gradient 1s ease alternate infinite;
}

.isValidMoveTarget:hover {
  transform: scale(1.05);
  animation: hover-gradient 1s ease alternate infinite;
}

@keyframes gradient {
  0% {
    background-color: rgba(0, 191, 255, 0.5);
  }

  100% {
    background-color: rgba(0, 98, 255, 0.7);
  }
}

@keyframes hover-gradient {
  0% {
    background-color: rgba(0, 229, 255, 0.5);
  }

  100% {
    background-color: rgba(0, 191, 255, 0.7);
  }
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

div.isSelectable {
  border-style: solid;
  border-width: 2px;
  border-top-color: rgb(124, 225, 126, 0.9);
  border-left-color: rgb(67, 123, 65, 0.9);
  border-right-color: rgb(10, 66, 9, 0.9);
  border-bottom-color: rgb(10, 66, 9, 0.9);
  border-radius: 5px;
}

div.isSelected {
  border-style: solid;
  border-width: 2px;
  border-top-color: rgba(114, 87, 85, 0.9);
  border-left-color: rgba(66, 52, 46, 0.9);
  border-right-color: rgba(230, 209, 188, 0.9);
  border-bottom-color: rgba(173, 149, 136, 0.9);
  border-radius: 5px;
}
</style>