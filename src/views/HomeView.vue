<script setup lang="ts">
import { testMachine } from '@/state-machines/testMachine'
import { useActor, useSelector } from '@xstate/vue';
import { onMounted, ref } from 'vue';
import type { Ref } from 'vue'
import type { Actor, AnyActorRef, Snapshot } from 'xstate'

const mainCommand = ref('')
const subCommand = ref('')
const { actorRef, snapshot } = useActor(testMachine)

function useChildActor(parentRef: AnyActorRef | Ref<AnyActorRef>, id: string): { actorRef: Actor, snapshot: Snapshot } {
  const actorRef = useSelector(parentRef, (s) => s.children[id]);
  const snapshot = useSelector(actorRef, (s) => s);

  return { actorRef, snapshot }
}

const { actorRef: childActorRef, snapshot: childSnapshot } = useChildActor(actorRef, 'sub-state')

onMounted(() => {
  actorRef.start()
})
</script>

<template>
  <main>
    <div class="flex">
      <div>
        <h3>{{ actorRef.id }}</h3>
        <pre>{{ snapshot }}</pre>
      </div>
      <div>
        <select v-model="mainCommand">
          <option disabled value="">Please select an event</option>
          <option v-for="event in actorRef.logic.events" :value="event" :key="event">
            {{ event }}
          </option>
        </select>
        <button v-if="!snapshot.matches('middle')" @click="() => { actorRef.send({ type: mainCommand }) }">send</button>
      </div>
    </div>
    <div v-if="childActorRef" class="flex">
      <div>
        <h3>{{ childActorRef.id }}</h3>
        <pre>{{ childSnapshot }}</pre>
      </div>
      <div>
        <select v-model="subCommand">
          <option disabled value="">Please select an event</option>
          <option v-for="event in childActorRef.logic.events" :value="event" :key="event">
            {{ event }}
          </option>
        </select>
        <button @click="() => { childActorRef?.send({ type: subCommand }) }">send
          to
          submachine</button>
      </div>
    </div>
  </main>
</template>

<style scoped>
.flex {
  align-items: center;
  display: flex;
  margin-bottom: 10px;
}

pre {
  background-color: aliceblue;
  padding: 10px;
}
</style>