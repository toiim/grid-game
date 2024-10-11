<script lang="ts" setup>
import type { Entity } from '@/stores/entity';

defineProps<{
  entity: Entity
}>()
</script>


<template>
  <div class="wrapper">


    <svg width="100" height="10">
      <defs>
        <linearGradient id="green" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#00ff55" />
          <stop offset="100%" stop-color="#00cc44" />
        </linearGradient>
        <linearGradient id="red" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#ff0055" />
          <stop offset="100%" stop-color="#990044" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" :width="99" height="9" fill="url(#red)" />
      <rect x="1" y="1" :width="entity.health / entity.maxHealth * 100" height="9" fill="url(#green)" />
    </svg>
    <pre>
name: {{ entity.name }}
health: {{ entity.health }} / {{ entity.maxHealth }}
strength: {{ entity.strength }}
team: {{ entity.teamId }}
status: {{ entity.status }}
        </pre>
  </div>
</template>
<style>
.wrapper {
  border: 1px solid black;
  padding: 0.25rem;
}
</style>