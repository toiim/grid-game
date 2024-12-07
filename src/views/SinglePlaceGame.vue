<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useMachine, useSelector } from '@xstate/vue'
import 'animate.css'
import { createLevel, type Coordinates, type Position } from '@/stores/single-entity-level'
import { gameMachine } from '@/state-machines/gameMachine'
import { level001 } from '@/assets/level-configs/level-001'
import { level002 } from '@/assets/level-configs/level-002'
import { findPath } from '@/composables/findPath'
import type { Subscription } from 'xstate'
import type { EntityId } from '@/stores/entity'
import ActionAnimation from '@/components/ActionAnimation.vue'
import EntityInfoCard from '@/components/EntityInfoCard.vue'
import type { LevelConfig } from '@/assets/level-configs/types'



const selectedLevel = ref<LevelConfig>(level002)
const { grid, entities, addEntity, updateEntity, moveEntity, blockedPositions, positions } = createLevel(selectedLevel.value.width, selectedLevel.value.height, selectedLevel.value.blockedPositions)
const cssBackground = computed(() => `url("backgrounds/${selectedLevel.value.background}.png")`)
const { actorRef: gameActor, snapshot: gameSnapshot } = useMachine(gameMachine)

onMounted(() => {
  gameActor.start()
  selectedLevel.value.entities.forEach(entityConfig => addEntity(entityConfig.coordinates, entityConfig.entity))
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
const subscriptions = ref<(Subscription | undefined)[]>([])
watch(turnActor, (newActor, oldActor) => {
  if (!newActor?.actorRef?.id) return
  if (gameSnapshot.value.matches('turn') && subscriptions.value.length === 0) {

    const moveSubscription = turnActorRef.value?.on('entity.move', ({ entityId, target }) => {
      moveEntity(entityId, target)
    })

    // add new subscriptions ie 'entity.attack'
    const attackSubscription = turnActorRef.value?.on('entity.skill', ({ skill, actor, target }) => {
      console.log(turnContext.value?.action)
      console.log(skill)
      if (!entities.value[target]) return
      updateEntity(target, 'health', entities.value[target].health - 1)
    })

    subscriptions.value = [moveSubscription, attackSubscription]

  }
  if (!oldActor?.actorRef?.id) return
  if (newActor.actorRef.id !== oldActor?.actorRef?.id) {
    subscriptions.value?.forEach((sub: undefined | Subscription) => sub?.unsubscribe())
    subscriptions.value = []
  }
})

const selectableMovePositions = computed<Set<Coordinates>>(() => {
  const range = 2

  const selectedId = turnContext.value?.selectedId
  if (!selectedId) return new Set<Coordinates>()
  const initialPosition = entities.value[selectedId].coordinates
  const surroundingPositions = new Set<Coordinates>()
  for (let x = -range; x < range + 1; x++) {
    for (let y = -range; y < range + 1; y++) {
      surroundingPositions.add(initialPosition)
    }
  }
  // for move only
  surroundingPositions.forEach((pos) => {
    if (grid.value[pos[1]][pos[0]]) surroundingPositions.delete(pos)
  })
  // for attack it would check that they exist
  surroundingPositions.delete(initialPosition)
  selectedLevel.value.blockedPositions.forEach((pos) => {
    surroundingPositions.delete(pos)
  })
  return surroundingPositions
})

const hoverTarget = ref<Position | undefined>(undefined)
const potentialPath = computed(() => {
  if (!hoverTarget.value || !turnContext.value?.selectedId || !entities.value[turnContext.value?.selectedId].position) return
  // TODO: ensure blockedPositions get dealt with
  return findPath({ ...grid.value }, [...blockedPositions.value], entities.value[turnContext.value?.selectedId].position, hoverTarget.value)
})

type PositionStates =
  | 'isSelectable'
  | 'isSelected'
  // | 'isValidAttackTarget'
  | 'isValidMoveTarget'
  // | 'isInPath'
  | 'isAccessible'

const getPositionStates = (coordinates: Coordinates, entityId: EntityId | undefined): Record<PositionStates, boolean> => ({
  isSelectable: !!((turnSnapshot.value?.matches({ 'teamTurn': 'unselected' }) || turnSnapshot.value?.matches({ 'teamTurn': 'selected' })) && turnContext && entityId && entities.value[entityId].teamId === turnContext.value?.teamId),
  isSelected: !!(entityId && turnContext.value?.selectedId === entityId),
  // isValidAttackTarget: !!(turnSnapshot.value?.context.action.type === 'attack' && turnSnapshot.value?.matches({ 'teamTurn': { 'selected': 'targetSelection' } }) && entityId && entities.value[entityId].teamId !== turnContext.value?.teamId),
  isValidMoveTarget: selectableMovePositions.value.has(coordinates),
  // isInPath: !!(potentialPath.value?.includes(position)),
  isAccessible: !(selectedLevel.value.blockedPositions.includes(coordinates))
})

</script>

<template>
  <div id="layout">
    <div id="meta">
      <button id="start-button" v-if="gameSnapshot.value === 'gameOpening'"
        @click="gameActor.send({ type: 'game.start' })">
        Start
      </button>
      <div class="flex">
        <EntityInfoCard v-for="entity in entities" :entity="entity" :key="entity.id" />
      </div>

      <h2 v-if="turnSnapshot?.matches('teamTurn')">{{ turnContext?.teamId.toUpperCase() }} Team's Turn</h2>
      <!-- <div v-if="turnActor?.snapshot?.matches('teamTurn')" class="inputs"> -->
      <template v-if="turnSnapshot?.matches({ 'teamTurn': 'selected' }) && turnContext?.selectedId" class="inputs">
        <!-- <EntityInfoCard :entity="entities[turnContext.selectedId]" /> -->
        <button @click="() => { turnActorRef?.send({ type: 'action.select', action: 'move' }) }">Move ➜</button>
        <button @click="() => { turnActorRef?.send({ type: 'action.select', action: 'attack' }) }">Attack ⚔️</button>
      </template>
      <button v-if="turnSnapshot?.matches('teamTurn')" @click="turnActorRef?.send({ type: 'turn.end' })">End
        Turn</button>
    </div>

    <div class="grid" @contextmenu.prevent="() => { turnActorRef?.send({ type: 'entity.deselect' }) }">
      <div v-for="( entityId, position ) in grid " :key="position" :class="getPositionStates(position, entityId)"
        :text="entityId"
        @mouseover="() => { if (getPositionStates(position, entityId).isValidMoveTarget) hoverTarget = position }"
        @click="() => {
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
        <img v-if="entityId" draggable="false" class="idle"
          :src="`/characters/character-${entities[entityId].name}.png`" :alt="entities[entityId].name" />
      </div>
    </div>
    <Transition name="action-animation-modal" enter-active-class="animate__animated animate__bounceInUp animate__fast"
      leave-active-class="animate__animated animate__bounceOutDown animate__fast">
      <div
        v-if="turnSnapshot?.matches({ 'teamTurn': { 'selected': 'actionAnimation' } }) && turnContext?.selectedId && turnContext?.action?.target && grid[turnContext?.action?.target]"
        class="animation-overlay">
        <ActionAnimation @complete="turnActorRef?.send({ type: 'action.end' })"
          :actor="entities[turnContext.selectedId]" :target="entities[(grid[turnContext?.action?.target]) as EntityId]"
          :action="turnContext.action" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.flex {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

#layout {
  position: relative;
  height: 100vh;
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
}

.grid {
  background: v-bind(cssBackground);
  background-size: cover;
  aspect-ratio: 1 / 1;
  width: 100%;
  padding: 5%;
  gap: 5%;
  image-rendering: pixelated;
  user-select: none;
  justify-content: center;
  display: grid;
  grid-template-columns: repeat(v-bind(selectedLevel.width), minmax(0, 1fr));
  grid-template-rows: repeat(v-bind(selectedLevel.height), minmax(0, 1fr));
}

.grid>div {
  position: relative;
  aspect-ratio: 1 / 1;

}

.grid>div>img {
  user-select: none;
  position: absolute;
  width: 80%;
  top: -20%;
}

@media (min-width: 510px) {
  #layout {
    grid-template-columns: 1fr 1fr;
  }
}

.animation-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: grid;
  align-content: center;
}

.animation-overlay>div {
  display: flex;
}

#meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: center;
  justify-content: center;
  border: 1px solid black;
  padding: 1rem;
}

button {
  min-width: 6rem;
  padding: 1rem;
  border: 1px solid black;
  text-align: center;
  align-self: center;
  transition: all 0.2s ease;
}

button:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 8px rgba(0, 0, 0, 0.2);
}

button:active {
  transform: translateY(1px);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
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

.isValidAttackTarget,
.isValidMoveTarget.isInPath {
  transition: transform 0.2s ease;
  animation: attack-gradient 1s ease alternate infinite;
}

.isValidAttackTarget:hover,
.isValidMoveTarget.isInPath:hover {
  transform: scale(1.05);
  animation: hover-attack-gradient 1s ease alternate infinite;
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

@keyframes attack-gradient {
  0% {
    background-color: rgba(255, 0, 0, 0.5);
  }

  100% {
    background-color: rgba(255, 38, 0, 0.7);
  }
}

@keyframes hover-attack-gradient {
  0% {
    background-color: rgba(255, 72, 0, 0.5);
  }

  100% {
    background-color: rgba(255, 123, 0, 0.7);
  }
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

.grid>div.isAccessible {
  display: grid;
  place-items: center;
  border-radius: 1px;
  border: 1px dotted rgba(255, 255, 255, 0.5);
}

.grid>div.isSelectable {
  border-style: solid;
  border-width: 2px;
  border-top-color: rgb(124, 225, 126, 0.9);
  border-left-color: rgb(67, 123, 65, 0.9);
  border-right-color: rgb(10, 66, 9, 0.9);
  border-bottom-color: rgb(10, 66, 9, 0.9);
  border-radius: 5px;
}

.grid>div.isSelected {
  border-style: solid;
  border-width: 2px;
  border-top-color: rgba(114, 87, 85, 0.9);
  border-left-color: rgba(66, 52, 46, 0.9);
  border-right-color: rgba(230, 209, 188, 0.9);
  border-bottom-color: rgba(173, 149, 136, 0.9);
  border-radius: 5px;
}
</style>