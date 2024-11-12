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

</script>

<template>
  <div id="layout">
    <div id="meta">
      meta
    </div>

    <div class="grid">
      <div v-for="( position ) in positions " :key="position.coordinates.join('-')" :text="position.entity"
        :class="{ isAccessible: !blockedPositions.includes(position) }">
        <img v-if="position.entity" draggable="false" class="idle"
          :src="`/characters/character-${entities[position.entity].name}.png`" :alt="entities[position.entity].name" />
      </div>
    </div>
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