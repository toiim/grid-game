<script setup lang="ts">
import ToolTip from '@/components/ToolTip.vue'
</script>

<template>

  <div class="about">
    <h1>This is an about page</h1>
    <ToolTip text="hello">
      <div> hello world </div>
    </ToolTip>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
