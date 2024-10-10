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
  }, 3500)
})

const targetUrl = computed(() => `url("/characters/character-${target.name}.png")`)

</script>

<template>
  <div class="wrapper" @click="$emit('complete')">
    <div class="actor animate__animated animate__headShake animate__delay-1s">
      <img :src="`/characters/character-${actor.name}.png`" />
    </div>
    <div class="target-wrapper animate__animated animate__jello animate__delay-2s">
      <div class="target">
        <img :src="`/characters/character-${target.name}.png`" />
      </div>
      <span class="animate__animated animate__fadeOutUp animate__delay-3s">-1 Health</span>
    </div>
  </div>
</template>


<style scoped>
.wrapper {
  margin: auto;
  width: 20rem;
  height: 12rem;
  padding: 1rem 3rem;
  box-shadow: 0 0.25rem 0.25rem 0 rgba(10, 40, 10, 0.4);
  background: linear-gradient(rgb(100, 190, 225), rgb(190, 240, 255) 50%, #428f42 50%, #317446 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.wrapper>div img {
  width: 4rem;
}

.target-wrapper {
  position: relative;
}

.target {
  aspect-ratio: 3 / 4;
  background-color: red;
  mask-image: v-bind(targetUrl);
  mask-size: 4rem;
}

.target>img {
  aspect-ratio: 3 / 4;
  width: 4rem;
  animation: flash 0.8s linear 2s;
}

.target-wrapper>span {
  position: absolute;
  font-size: smaller;
  width: 70px;
  top: -20px;
  left: 0;
  color: red;
  background-color: white;
  box-shadow: 0 0.25rem 0.25rem 0 rgba(10, 40, 10, 0.4);
  text-align: center;
  border-radius: 999px;
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