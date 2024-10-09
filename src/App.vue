<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Test</RouterLink>
      <RouterLink to="/single-game">Game</RouterLink>
    </nav>
  </header>

  <RouterView />
</template>
