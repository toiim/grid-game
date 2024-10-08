<script lang="ts" setup>
import 'animate.css';
import type { Action } from '@/state-machines/turnMachine';
import type { Entity } from '@/stores/entity';
import { computed, defineProps, onMounted } from 'vue'

const { actor, target, action } = defineProps<{
  actor: Entity,
  target: Entity,
  action: Action
}>()
const emit = defineEmits<{
  complete: []
}>()

onMounted(() => {
  setTimeout(() => {
    emit('complete')
  }, 3000)
})

const targetUrl = computed(() => `url("/characters/character-${target.name}.png")`)

</script>

<template>
  <div class="wrapper" @click="$emit('complete')">
    <img class="actor animate__animated animate__headShake animate__delay-1s"
      :src="`/characters/character-${actor.name}.png`" />
    <div class="target animate__animated animate__jello animate__delay-2s">
      <img :src="`/characters/character-${target.name}.png`" />
    </div>
  </div>
</template>


<style scoped>
.wrapper {
  margin: auto;
  padding: 1rem 3rem;
  box-shadow: 0 0.25rem 0.25rem 0 rgba(10, 40, 10, 0.4);
  border-radius: 0.25rem;
  background: linear-gradient(rgb(100, 190, 225), rgb(190, 240, 255) 50%, #428f42 50%, #317446 100%);
}

.target {
  width: 30px;
  height: 40px;
  background-color: red;
  mask-image: v-bind(targetUrl);
}

.target>img {
  animation: flash 0.8s linear 2s;
}

@keyframes flash {
  25% {
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  75% {
    opacity: 0;
  }
}

img {
  image-rendering: pixelated;
}
</style>