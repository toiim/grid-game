<script lang="ts" setup>
defineProps({
  text: String
})
</script>

<template>
  <div class="target">
    <span class="tip">
      {{ text }}
    </span>
    <slot />
  </div>
</template>

<style scoped>
.target {
  position: relative;
}

.target>.tip {
  user-select: auto;
  line-height: 1.4rem;
  opacity: 0;
  display: block;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(2px);
  position: absolute;
  top: 0rem;
  padding: 2px 10px;
  border-radius: 3px;
  color: white;
  transition: top 0.2s ease, opacity 1s cubic-bezier(0, 1, 0, 1);
}

.target:hover>.tip {
  opacity: 1;

  position: absolute;
  top: -2rem;
}

.tip::after {
  opacity: 0.5;
  transition: opacity 1s cubic-bezier(0, 1, 0, 1);
  content: "";
  position: absolute;
  top: 100%;
  left: 50%;
  margin-left: -5px;
  border-width: 5px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.7) transparent transparent transparent;
  backdrop-filter: blur(2px);
}

.target:hover>.tip::after {
  opacity: 1;
}
</style>
