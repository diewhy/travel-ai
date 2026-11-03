<script setup>
import { computed } from 'vue'

const props = defineProps({ name: { type: String, required: true } })
const paths = {'house': '<path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9"/><path d="M9 21v-7h6v7"/>', 'compass': '<circle cx="12" cy="12" r="9"/><path d="m16.2 7.8-2.5 5.9-5.9 2.5 2.5-5.9z"/>', 'map-pin': '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>', 'route': '<circle cx="6" cy="19" r="2"/><path d="M9 19h8a4 4 0 0 0 0-8H7a4 4 0 0 1 0-8h8"/><path d="m12 1 3 2-3 2"/>', 'palette': '<path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.6-3.2 2 2 0 0 1 1.6-3.2H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>', 'user-round': '<circle cx="12" cy="8" r="4"/><path d="M5 21a7 7 0 0 1 14 0"/>'}
const markup = computed(() => paths[props.name] || paths.compass)
</script>

<template>
  <svg class="rp-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="markup" />
</template>

<style scoped>
.rp-icon { display: inline-block; width: 20px; height: 20px; flex: 0 0 20px; vertical-align: middle; }
</style>
