<script setup lang="ts">
defineProps<{
  cols?: number
  rows?: number
}>()
</script>

<template>
  <div class="animate-pulse">
    <div class="border-b border-zinc-100 dark:border-zinc-800 px-5 py-3 flex gap-4">
      <div v-for="c in (cols || 4)" :key="c" class="h-3 bg-zinc-200 dark:bg-zinc-700 rounded flex-1" />
    </div>
    <div v-for="r in (rows || 5)" :key="r" class="border-b border-zinc-50 dark:border-zinc-800/50 last:border-0 px-5 py-4 flex gap-4">
      <div v-for="c in (cols || 4)" :key="c" class="h-3 bg-zinc-100 dark:bg-zinc-800 rounded flex-1" />
    </div>
  </div>
</template>
