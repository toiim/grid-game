<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Test</RouterLink>
      ..
      <RouterLink to="/old-game">Old Game</RouterLink>
      ..
      <RouterLink to="/game">Game</RouterLink>
    </nav>
  </header>
  <div class="container">

    <RouterView />
  </div>
</template>

<style>
:root {
  font-family: Arial, Helvetica, sans-serif;
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
    margin: 0 auto;
  }
}
</style>