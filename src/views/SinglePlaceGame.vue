<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useMachine, useSelector } from '@xstate/vue'
import { createLevel } from '@/stores/single-entity-level'
import { gameMachine } from '@/state-machines/gameMachine'

const gridX = 5;
const gridY = 5

const { grid, entities, addEntity, entityIds, updateEntity } = createLevel(gridX, gridY)

const { actorRef: gameActor, snapshot: gameSnapshot } = useMachine(gameMachine)

onMounted(() => {
  gameActor.start()
  addEntity(
    0, 0, {
    level: 1,
    name: 'blue',
    skills: [],
    defense: 10,
    strength: 10,
    health: 10,
    speed: 10,
    status: [],
    magicSkill: 50,
  })
  addEntity(
    2, 2, {
    level: 1,
    name: 'red',
    skills: [],
    defense: 10,
    strength: 10,
    health: 10,
    speed: 10,
    status: [],
    magicSkill: 50,
  })
  addEntity(
    4, 3, {
    level: 1,
    name: 'purple',
    skills: [],
    defense: 10,
    strength: 10,
    health: 10,
    speed: 10,
    status: [],
    magicSkill: 50,
  })

})

const turnActor = computed(() => {
  if (gameSnapshot.value.children['good-turn']) {
    const actorRef = useSelector(gameActor, (s) => s.children['good-turn']);
    const snapshot = useSelector(actorRef, (s) => s);
    return { actorRef: actorRef.value, snapshot: snapshot.value }
  }
  if (gameSnapshot.value.children['good-turn']) {
    const actorRef = useSelector(gameActor, (s) => s.children['good-turn']);
    const snapshot = useSelector(actorRef, (s) => s);
    return { actorRef: actorRef.value, snapshot: snapshot.value }
  }
  return undefined
})

const turnActorRef = computed(() => turnActor.value?.actorRef)
const turnSnapshot = computed(() => turnActor.value?.snapshot)
const turnContext = computed(() => turnActor.value?.snapshot?.context)

</script>

<template>
  <div class="layout">
    <button v-if="gameSnapshot.value === 'gameOpening'" @click="gameActor.send({ type: 'game.start' })">
      Start
    </button>

    <!-- <div v-if="turnActor?.snapshot?.matches('teamTurn')" class="inputs"> -->
    <div v-if="turnActor?.snapshot?.matches({ 'teamTurn': 'selected' })" class="inputs">
      <h2>{{ turnContext?.selectedId && entities[turnContext.selectedId].name }}</h2>
      <button @click="() => { turnActorRef?.send({ 'type': 'action.select' }) }">Move ➜</button>
      <button @click="() => { turnActorRef?.send({ 'type': 'action.select' }) }">Attack ⚔️</button>
    </div>

    <!-- GRID -->
    <div class="grid" @contextmenu.prevent="() => { turnActorRef?.send({ type: 'entity.deselect' }) }">
      <div v-for="( entityId, position ) in grid " :key="position"
        :class="{ selected: entityId && turnContext?.selectedId === entityId }" :text="entityId" @click="() => {

          // 
          turnSnapshot?.matches({ 'teamTurn': 'unselected' }) && entityId && turnActorRef?.send({ type: 'entity.select', entityId: entityId });
          //
          turnSnapshot?.matches({ teamTurn: { 'selected': 'targetSelection' } }) && turnActorRef?.send({ type: 'target.select' })

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

.good-turn {
  background-color: lightblue;
}

.bad-turn {
  background-color: lightcoral;
}

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

.state {
  font-size: xx-small;
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
  border: 1px dashed rgba(255,255, 255, 0.9);
  color: white;
}
</style>